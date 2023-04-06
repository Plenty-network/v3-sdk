import BigNumber from "bignumber.js";

import { Liquidity, Tick } from "../utils";
import { Token } from "../types";
import { SPACE_TO_RANGE, MAX_TICK } from "../utils";

export class Pool {
  currTickIndex: number;
  tickSpacing: number;
  sqrtPrice: BigNumber;
  tokenX: Token;
  tokenY: Token;

  constructor(currTickIndex: number, tickSpacing: number, sqrtPrice: BigNumber, tokenX: Token, tokenY: Token) {
    this.currTickIndex = currTickIndex;
    this.tickSpacing = tickSpacing;
    this.sqrtPrice = sqrtPrice;
    this.tokenX = tokenX;
    this.tokenY = tokenY;
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
   * Given amount of token Y being supplied to a price range, the function estimates the amount of X
   * required for the equivalent liquidity
   * @param amount Amount of token Y
   * @param sqrtPriceAx80 Lower price boundary
   * @param sqrtPriceBx80 Upper price boundary
   */
  estimateAmountXFromY(amount: BigNumber, sqrtPriceAx80: BigNumber, sqrtPriceBx80: BigNumber): BigNumber {
    const liquidity = Liquidity.computeLiquidityFromAmountY(amount, sqrtPriceAx80, this.sqrtPrice);
    return Liquidity.computeAmountXFromLiquidity(liquidity, this.sqrtPrice, sqrtPriceBx80);
  }

  /**
   * Given amount of token X being supplied to a price range, the function estimates the amount of Y
   * required for the equivalent liquidity
   * @param amount Amount of token X
   * @param sqrtPriceAx80 Lower price boundary
   * @param sqrtPriceBx80 Upper price boundary
   */
  estimateAmountYFromX(amount: BigNumber, sqrtPriceAx80: BigNumber, sqrtPriceBx80: BigNumber): BigNumber {
    const liquidity = Liquidity.computeLiquidityFromAmountX(amount, this.sqrtPrice, sqrtPriceBx80);
    return Liquidity.computeAmountYFromLiquidity(liquidity, sqrtPriceAx80, this.sqrtPrice);
  }
}
