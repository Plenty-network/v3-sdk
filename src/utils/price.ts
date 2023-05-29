import BigNumber from "bignumber.js";

import { Math2 } from "./math2";

export abstract class Price {
  /**
   * Computes sqrt price (precision 2^80) using the real price
   * @param realPrice The real price Y / X of the token scaled to decimals
   * @param tokenXDecimals decimals of token x
   * @param tokenYDecimals decimals of token y
   */
  static computeSqrtPriceFromRealPrice(
    realPrice: BigNumber,
    tokenXDecimals: number,
    tokenYDecimals: number
  ): BigNumber {
    return Math2.sqrt(
      Math2.bitShift(realPrice.multipliedBy(10 ** tokenYDecimals).decimalPlaces(10 ** tokenXDecimals), -160)
    );
  }

  /**
   * Computes real price (Y / X) through sqrt price (Y / X)
   * @param sqrtPricex80 sqrt price (Y / X)
   * @param tokenXDecimals decimals of token x
   * @param tokenYDecimals decimals of token y
   */
  static computeRealPriceFromSqrtPrice(
    sqrtPricex80: BigNumber,
    tokenXDecimals: number,
    tokenYDecimals: number
  ): BigNumber {
    return Math2.bitShift(sqrtPricex80, 80)
      .pow(2)
      .multipliedBy(10 ** tokenXDecimals)
      .dividedBy(10 ** tokenYDecimals);
  }
}
