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
   * Computes real price (tokenY / tokenX) or (tokenX / tokenY)
   * This does not consider the granularity scaling. To get scaled values the decimals
   * need to be multiplied
   * @param sqrtPricex80 The sqrt price that is to be converted
   */
  static computeRealPriceFromSqrtPrice(sqrtPricex80: BigNumber): BigNumber {
    return Math2.bitShift(sqrtPricex80, 80).pow(2);
  }
}
