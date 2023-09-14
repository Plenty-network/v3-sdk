import BigNumber from "bignumber.js";

import { Math2 } from "./math2";
import { Q80 } from "./constants";
import { BalanceNat } from "../types";

export abstract class Liquidity {
  /**
   * Computes the position liquidity based on the current price and supplied price boundaries
   * @param amount Token amounts contributed for the position
   * @param sqrtPriceCx80 Current price in the pool
   * @param sqrtPriceAx80 Lower price boundary of the position
   * @param sqrtPriceBx80 Upper price boundary of the position
   */
  static computeLiquidityFromAmount(
    amount: BalanceNat,
    sqrtPriceCx80: BigNumber,
    sqrtPriceAx80: BigNumber,
    sqrtPriceBx80: BigNumber
  ): BigNumber {
    if (sqrtPriceAx80.isGreaterThan(sqrtPriceBx80)) {
      [sqrtPriceAx80, sqrtPriceBx80] = [sqrtPriceBx80, sqrtPriceAx80];
    }

    if (sqrtPriceBx80.isLessThanOrEqualTo(sqrtPriceCx80)) {
      // Entire position in Y
      return this.computeLiquidityFromAmountY(amount.y, sqrtPriceAx80, sqrtPriceBx80);
    } else if (sqrtPriceAx80.isGreaterThanOrEqualTo(sqrtPriceCx80)) {
      // Entire position in X
      return this.computeLiquidityFromAmountX(amount.x, sqrtPriceAx80, sqrtPriceBx80);
    } else {
      // Distribute evenly for X and Y
      return BigNumber.min(
        this.computeLiquidityFromAmountY(amount.y, sqrtPriceAx80, sqrtPriceCx80),
        this.computeLiquidityFromAmountX(amount.x, sqrtPriceCx80, sqrtPriceBx80)
      );
    }
  }

  /**
   * Computes the liquidity delta based on token X amount
   * @param amount Amount of token X
   * @param sqrtPriceAx80 Lower price boundary
   * @param sqrtPriceBx80 Upper price boundary
   */
  static computeLiquidityFromAmountX(amount: BigNumber, sqrtPriceAx80: BigNumber, sqrtPriceBx80: BigNumber): BigNumber {
    if (sqrtPriceAx80.isGreaterThan(sqrtPriceBx80)) {
      [sqrtPriceAx80, sqrtPriceBx80] = [sqrtPriceBx80, sqrtPriceAx80];
    }

    // Liquidity in terms of token x amount
    // Derived from: dX = dL(1/sqrt(Pa) - 1/sqrt(Pb))
    return Math2.floor(
      amount
        .multipliedBy(sqrtPriceAx80)
        .multipliedBy(sqrtPriceBx80)
        .dividedBy(sqrtPriceBx80.minus(sqrtPriceAx80).multipliedBy(Q80))
    );
  }

  /**
   * Computes the liquidity delta based on token Y amount
   * @param amount Amount of token Y
   * @param sqrtPriceAx80 Lower price boundary
   * @param sqrtPriceBx80 Upper price boundary
   */
  static computeLiquidityFromAmountY(amount: BigNumber, sqrtPriceAx80: BigNumber, sqrtPriceBx80: BigNumber): BigNumber {
    if (sqrtPriceAx80.isGreaterThan(sqrtPriceBx80)) {
      [sqrtPriceAx80, sqrtPriceBx80] = [sqrtPriceBx80, sqrtPriceAx80];
    }

    // Liquidity in terms of token y amount
    // Derived from: dY = dL(sqrt(Pb) - sqrt(pa))
    return Math2.floor(amount.multipliedBy(Q80).dividedBy(sqrtPriceBx80.minus(sqrtPriceAx80)));
  }

  /**
   * Given liquidity, current price and price boundaries it calculate the amount of tokens that make up
   * that liquidity
   * @param liquidity Liquidity delta
   * @param sqrtPriceCx80 Current sqrt price in the pool contract
   * @param sqrtPriceAx80 Lower price boundary
   * @param sqrtPriceBx80 Upper price boundary
   */
  static computeAmountFromLiquidity(
    liquidity: BigNumber,
    sqrtPriceCx80: BigNumber,
    sqrtPriceAx80: BigNumber,
    sqrtPriceBx80: BigNumber
  ): BalanceNat {
    if (sqrtPriceAx80.isGreaterThan(sqrtPriceBx80)) {
      [sqrtPriceAx80, sqrtPriceBx80] = [sqrtPriceBx80, sqrtPriceAx80];
    }

    if (sqrtPriceBx80.isLessThanOrEqualTo(sqrtPriceCx80)) {
      // Entire position in Y
      return {
        x: new BigNumber(0),
        y: this.computeAmountYFromLiquidity(liquidity, sqrtPriceAx80, sqrtPriceBx80),
      };
    } else if (sqrtPriceAx80.isGreaterThanOrEqualTo(sqrtPriceCx80)) {
      // Entire position in X
      return {
        x: this.computeAmountXFromLiquidity(liquidity, sqrtPriceAx80, sqrtPriceBx80),
        y: new BigNumber(0),
      };
    } else {
      // Distribute evenly for X and Y
      return {
        x: this.computeAmountXFromLiquidity(liquidity, sqrtPriceCx80, sqrtPriceBx80),
        y: this.computeAmountYFromLiquidity(liquidity, sqrtPriceAx80, sqrtPriceCx80),
      };
    }
  }

  /**
   * Given liquidity and price boundaries, the function computes token X amount
   * @param liquidity Liquidity delta
   * @param sqrtPriceAx80 Lower price boundary
   * @param sqrtPriceBx80 Upper price boundary
   */
  static computeAmountXFromLiquidity(
    liquidity: BigNumber,
    sqrtPriceAx80: BigNumber,
    sqrtPriceBx80: BigNumber
  ): BigNumber {
    if (sqrtPriceAx80.isGreaterThan(sqrtPriceBx80)) {
      [sqrtPriceAx80, sqrtPriceBx80] = [sqrtPriceBx80, sqrtPriceAx80];
    }

    // dX = dL(1/sqrt(Pa) - 1/sqrt(Pb))
    return Math2.ceil(
      liquidity
        .multipliedBy(sqrtPriceBx80.minus(sqrtPriceAx80))
        .multipliedBy(Q80)
        .dividedBy(sqrtPriceAx80.multipliedBy(sqrtPriceBx80))
    ).abs();
  }

  /**
   * Given liquidity and price boundaries, the function computes token Y amount
   * @param liquidity Liquidity delta
   * @param sqrtPriceAx80 Lower price boundary
   * @param sqrtPriceBx80 Upper price boundary
   */
  static computeAmountYFromLiquidity(
    liquidity: BigNumber,
    sqrtPriceAx80: BigNumber,
    sqrtPriceBx80: BigNumber
  ): BigNumber {
    if (sqrtPriceAx80.isGreaterThan(sqrtPriceBx80)) {
      [sqrtPriceAx80, sqrtPriceBx80] = [sqrtPriceBx80, sqrtPriceAx80];
    }

    // dX = dL(1/sqrt(Pa) - 1/sqrt(Pb))
    return Math2.ceil(liquidity.multipliedBy(sqrtPriceBx80.minus(sqrtPriceAx80)).dividedBy(Q80)).abs();
  }
}
