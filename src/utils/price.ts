import BigNumber from "bignumber.js";

import { Math2 } from "./math2";
import { BalanceNat } from "../types";

export abstract class Price {
  /**
   * Computes sqrt price (precision 2^80) using the tokens amounts
   * @param amount The amount of each token
   */
  static computeSqrtPriceFromAmount(amount: BalanceNat): BigNumber {
    return Math2.sqrt(Math2.bitShift(amount.y.dividedBy(amount.x), -160));
  }

  /**
   * Computes real price (Y / X) through sqrt price (Y / X)
   * @param sqrtPricex80 sqrt price (Y / X)
   * @param tokenX base token
   * @param tokenY quote token
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
