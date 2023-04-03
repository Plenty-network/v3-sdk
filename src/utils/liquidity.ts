import BigNumber from "bignumber.js";

import { Q80 } from "./constants";
import { BalanceNat } from "../types";

export abstract class Liquidity {
  /**
   * Computes the liquidity from amount of tokens being allocated to a particular price range.
   * @param amount Amounts of token X and Y
   * @param priceA Price at lower tick
   * @param priceB Price at upper tick
   */
  static computeLiquidityFromAmount(amount: BalanceNat, sqrtPriceAx80: BigNumber, sqrtPriceBx80: BigNumber): BigNumber {
    if (sqrtPriceAx80.isGreaterThan(sqrtPriceBx80)) {
      [sqrtPriceAx80, sqrtPriceBx80] = [sqrtPriceBx80, sqrtPriceAx80];
    }

    // Liquidity in terms of token x amount
    // Derived from: dX = dL(1/sqrt(Pa) - 1/sqrt(Pb))
    const lx = amount.x
      .multipliedBy(sqrtPriceAx80)
      .multipliedBy(sqrtPriceBx80)
      .dividedBy(sqrtPriceBx80.minus(sqrtPriceAx80))
      .dividedBy(Q80);

    // Liquidity in terms of token y amount
    // Derived from: dY = dL(sqrt(Pb) - sqrt(pa))
    const ly = amount.y.multipliedBy(Q80).dividedBy(sqrtPriceBx80.minus(sqrtPriceAx80));

    // Return the minimum to fit the bound of token with lesser amount
    return BigNumber.min(lx, ly);
  }
}
