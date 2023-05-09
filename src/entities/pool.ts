import BigNumber from "bignumber.js";

import { Token } from "../types";
import { Liquidity, Price, Tick, SPACE_TO_RANGE, MAX_TICK } from "../utils";

export class Pool {
  public readonly tokenX: Token;
  public readonly tokenY: Token;
  public readonly currTickIndex: number;
  public readonly tickSpacing: number;
  public readonly sqrtPrice: BigNumber;

  constructor(tokenX: Token, tokenY: Token, currTickIndex: number, tickSpacing: number, sqrtPrice: BigNumber) {
    this.tokenX = tokenX;
    this.tokenY = tokenY;
    this.currTickIndex = currTickIndex;
    this.tickSpacing = tickSpacing;
    this.sqrtPrice = sqrtPrice;
  }

  /**
   * Computes price Y / X scaled based on token decimals
   */
  getRealPriceTokenY(): BigNumber {
    return Price.computeRealPriceFromSqrtPrice(this.sqrtPrice)
      .multipliedBy(10 ** this.tokenX.decimals)
      .dividedBy(10 ** this.tokenY.decimals);
  }

  /**
   * Computes price X / Y scaled based on token decimals
   */
  getRealPriceTokenX(): BigNumber {
    // Not very precise, but serves the purpose of calculating a user readable real price
    return new BigNumber(1)
      .dividedBy(Price.computeRealPriceFromSqrtPrice(this.sqrtPrice))
      .multipliedBy(10 ** this.tokenY.decimals)
      .dividedBy(10 ** this.tokenX.decimals);
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
}
