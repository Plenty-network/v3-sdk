import BigNumber from "bignumber.js";

import { Math2 } from "./math2";
import { Token } from "../types";
import { Helpers } from "./helpers";

export abstract class Price {
  /**
   * Computes sqrt price (precision 2^80) using the real price
   * @param realPrice The real price Y / X of the token scaled to decimals
   * @param tokenX first token in the pair
   * @param tokenY second token in the pair
   */
  static computeSqrtPriceFromRealPrice(realPrice: BigNumber, tokenX: Token, tokenY: Token): BigNumber {
    // Reorder tokens based on address and token-id
    const [tx, ty] = Helpers.orderTokens(tokenX, tokenY);
    return Math2.sqrt(Math2.bitShift(realPrice.multipliedBy(10 ** ty.decimals).dividedBy(10 ** tx.decimals), -160));
  }

  /**
   * Computes real price (Y / X) through sqrt price (Y / X)
   * @param sqrtPricex80 sqrt price (Y / X)
   * @param tokenX first token in the pair
   * @param tokenY second token in the pair
   */
  static computeRealPriceFromSqrtPrice(sqrtPricex80: BigNumber, tokenX: Token, tokenY: Token): BigNumber {
    // Reorder tokens based on address and token-id
    const [tx, ty] = Helpers.orderTokens(tokenX, tokenY);
    return sqrtPricex80
      .dividedBy(new BigNumber(2).pow(80))
      .pow(2)
      .multipliedBy(10 ** tx.decimals)
      .dividedBy(10 ** ty.decimals);
  }
}
