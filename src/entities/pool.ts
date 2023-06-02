import BigNumber from "bignumber.js";

import { TickElement, Token } from "../types";
import { Liquidity, Price, Tick, SPACE_TO_RANGE, MAX_TICK, Math2, Swap, ZERO_VAL } from "../utils";

interface EstimateStep {
  storage: {
    currTickIndex: number;
    currTickWitness: number;
    sqrtPrice: BigNumber;
    liquidity: BigNumber;
  };
  dx: BigNumber;
  dy: BigNumber;
}

export class Pool {
  public readonly tokenX: Token;
  public readonly tokenY: Token;
  public readonly currTickIndex: number;
  public readonly currTickWitness: number;
  public readonly tickSpacing: number;
  public readonly sqrtPrice: BigNumber;
  public readonly feeBps: number;
  public readonly liquidity: BigNumber;

  constructor(
    tokenX: Token,
    tokenY: Token,
    currTickIndex: number,
    currentTickWitness: number,
    tickSpacing: number,
    sqrtPrice: BigNumber,
    feeBps: number,
    liquidity: BigNumber
  ) {
    this.tokenX = tokenX;
    this.tokenY = tokenY;
    this.currTickIndex = currTickIndex;
    this.currTickWitness = currentTickWitness;
    this.tickSpacing = tickSpacing;
    this.sqrtPrice = sqrtPrice;
    this.feeBps = feeBps;
    this.liquidity = liquidity;
  }

  /**
   * Computes real price with Y as quote
   */
  getRealPriceTokenY(): BigNumber {
    // Not very precise, but serves the purpose of calculating a user readable real price
    return new BigNumber(1).dividedBy(
      Price.computeRealPriceFromSqrtPrice(this.sqrtPrice, this.tokenX.decimals, this.tokenY.decimals)
    );
  }

  /**
   * Computes real price with X as quote
   */
  getRealPriceTokenX(): BigNumber {
    return Price.computeRealPriceFromSqrtPrice(this.sqrtPrice, this.tokenX.decimals, this.tokenY.decimals);
  }

  /**
   * Computes the starting minimum and maximum price boundaries when setting a new position
   */
  getInitialBoundaries(): [number, number] {
    const lowerTickIndex = Tick.nearestUsableTick(
      Math.max(this.currTickIndex - SPACE_TO_RANGE[this.tickSpacing], -MAX_TICK),
      this.tickSpacing
    );
    const upperTickIndex = Tick.nearestUsableTick(
      Math.min(this.currTickIndex + SPACE_TO_RANGE[this.tickSpacing], MAX_TICK),
      this.tickSpacing
    );
    return [lowerTickIndex, upperTickIndex];
  }

  /**
   * Computes the tick boundaries for a full range position
   */
  getFullRangeBoundaries(): [number, number] {
    return [Tick.nearestUsableTick(-MAX_TICK, this.tickSpacing), Tick.nearestUsableTick(MAX_TICK, this.tickSpacing)];
  }

  /**
   * Given amount of token Y being supplied to a price range, the function estimates the amount of X
   * required for the equivalent liquidity
   * @param amount Amount of token Y
   * @param lowerTickIndex Lower tick of the price range
   * @param upperTickIndex Upper tick of the price range
   */
  estimateAmountXFromY(amount: BigNumber, lowerTickIndex: number, upperTickIndex: number): BigNumber {
    const liquidity = Liquidity.computeLiquidityFromAmountY(
      amount,
      Tick.computeSqrtPriceFromTick(lowerTickIndex),
      this.sqrtPrice
    );
    return Liquidity.computeAmountXFromLiquidity(
      liquidity,
      this.sqrtPrice,
      Tick.computeSqrtPriceFromTick(upperTickIndex)
    );
  }

  /**
   * Given amount of token X being supplied to a price range, the function estimates the amount of Y
   * required for the equivalent liquidity
   * @param amount Amount of token X
   * @param lowerTickIndex Lower tick of the price range
   * @param upperTickIndex Upper tick of the price range
   */
  estimateAmountYFromX(amount: BigNumber, lowerTickIndex: number, upperTickIndex: number): BigNumber {
    const liquidity = Liquidity.computeLiquidityFromAmountX(
      amount,
      this.sqrtPrice,
      Tick.computeSqrtPriceFromTick(upperTickIndex)
    );
    return Liquidity.computeAmountYFromLiquidity(
      liquidity,
      Tick.computeSqrtPriceFromTick(lowerTickIndex),
      this.sqrtPrice
    );
  }

  /**
   * Estimates the output dy received when a certain amount of token x is swapped in a pool
   * @param amount Amount of token x
   * @param getTick A provider of tick data
   */
  async estimateSwapXToY(amount: BigNumber, getTick: (index: number) => Promise<TickElement>): Promise<EstimateStep> {
    try {
      let step: EstimateStep = {
        storage: {
          currTickIndex: this.currTickIndex,
          currTickWitness: this.currTickWitness,
          sqrtPrice: this.sqrtPrice,
          liquidity: this.liquidity,
        },
        dx: amount,
        dy: ZERO_VAL,
      };

      while (true) {
        if (step.storage.liquidity.isEqualTo(0)) {
          return step;
        } else {
          const fee = Math2.ceil(step.dx.multipliedBy(this.feeBps).dividedBy(10000));
          const sqrtPriceNew = Swap.sqrtPriceMoveX(step.storage.sqrtPrice, step.dx.minus(fee), step.storage.liquidity);
          const currTickIndexNew = Swap.calcNewCurrTickIndex(
            step.storage.currTickIndex,
            step.storage.sqrtPrice,
            sqrtPriceNew
          );
          if (currTickIndexNew >= step.storage.currTickWitness) {
            const dy = Math2.bitShift(
              step.storage.sqrtPrice.minus(sqrtPriceNew).multipliedBy(step.storage.liquidity),
              80
            );

            return {
              storage: { ...step.storage, currTickIndex: currTickIndexNew, sqrtPrice: sqrtPriceNew },
              dx: ZERO_VAL,
              dy: step.dy.plus(dy),
            };
          } else {
            const tick = await getTick(step.storage.currTickWitness);
            const loTick = tick.prevIndex;
            const sqrtPriceNew = tick.sqrtPrice.minus(1);
            const dy = Math2.bitShift(
              step.storage.sqrtPrice.minus(sqrtPriceNew).multipliedBy(step.storage.liquidity),
              80
            );
            const dxForDy = Math2.ceil(
              Math2.bitShift(dy, -160).dividedBy(sqrtPriceNew.multipliedBy(step.storage.sqrtPrice))
            );
            const dxConsumed = dxForDy.multipliedBy(10000).dividedBy(10000 - this.feeBps);
            step = {
              storage: {
                currTickIndex: tick.index,
                currTickWitness: loTick,
                sqrtPrice: sqrtPriceNew,
                liquidity: step.storage.liquidity.minus(tick.liquidityNet),
              },
              dx: step.dx.minus(dxConsumed),
              dy: dy.plus(dy),
            };
          }
        }
      }
    } catch (err) {
      throw err;
    }
  }

  /**
   * Estimates the output dx received when a certain amount of token y is swapped in a pool
   * @param amount The amount of token y
   * @param getTick A provider of tick data
   */
  async estimateSwapYToX(amount: BigNumber, getTick: (index: number) => Promise<TickElement>): Promise<EstimateStep> {
    try {
      let step: EstimateStep = {
        storage: {
          currTickIndex: this.currTickIndex,
          currTickWitness: this.currTickWitness,
          sqrtPrice: this.sqrtPrice,
          liquidity: this.liquidity,
        },
        dx: ZERO_VAL,
        dy: amount,
      };

      while (true) {
        if (step.storage.liquidity.isEqualTo(0)) {
          return step;
        } else {
          const fee = Math2.ceil(step.dy.multipliedBy(this.feeBps).dividedBy(10000));
          const sqrtPriceNew = Swap.sqrtPriceMoveY(step.storage.sqrtPrice, step.dy.minus(fee), step.storage.liquidity);
          const currTickIndexNew = Swap.calcNewCurrTickIndex(
            step.storage.currTickIndex,
            step.storage.sqrtPrice,
            sqrtPriceNew
          );
          const tick = await getTick(step.storage.currTickWitness);
          const nextTickIndex = tick.nextIndex;
          if (currTickIndexNew < nextTickIndex) {
            const dx = Math2.floor(
              Math2.bitShift(step.storage.liquidity, -80)
                .multipliedBy(sqrtPriceNew.minus(step.storage.sqrtPrice))
                .dividedBy(step.storage.sqrtPrice.multipliedBy(sqrtPriceNew))
            );
            return {
              storage: { ...step.storage, currTickIndex: currTickIndexNew, sqrtPrice: sqrtPriceNew },
              dx: step.dx.plus(dx),
              dy: ZERO_VAL,
            };
          } else {
            const nextTick = await getTick(nextTickIndex);
            const sqrtPriceNew = nextTick.sqrtPrice;
            const dx = Math2.floor(
              Math2.bitShift(step.storage.liquidity, -80)
                .multipliedBy(sqrtPriceNew.minus(step.storage.sqrtPrice))
                .dividedBy(step.storage.sqrtPrice.multipliedBy(sqrtPriceNew))
            );
            const dyForDx = Math2.ceil(
              Math2.bitShift(step.storage.liquidity.multipliedBy(sqrtPriceNew.minus(step.storage.sqrtPrice)), 80)
            );
            const dyConsumed = dyForDx.multipliedBy(10000).dividedBy(10000 - this.feeBps);
            step = {
              storage: {
                currTickIndex: nextTick.index,
                currTickWitness: nextTick.index,
                sqrtPrice: sqrtPriceNew,
                liquidity: step.storage.liquidity.plus(nextTick.liquidityNet),
              },
              dx: step.dx.plus(dx),
              dy: step.dy.minus(dyConsumed),
            };
          }
        }
      }
    } catch (err) {
      throw err;
    }
  }
}
