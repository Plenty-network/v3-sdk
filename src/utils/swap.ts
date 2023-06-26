import BigNumber from "bignumber.js";

import { Tick } from "./tick";
import { Math2 } from "./math2";

export abstract class Swap {
  /**
   * Returns the new square root price when swapping X for Y
   * @param currSqrtPrice Old or current squared price
   * @param dx Amount of token x being swapped
   * @param liquidity Current liquidity
   */
  static sqrtPriceMoveX(currSqrtPrice: BigNumber, dx: BigNumber, liquidity: BigNumber): BigNumber {
    const num = Math2.bitShift(liquidity.multipliedBy(currSqrtPrice), -80);
    const denom = Math2.bitShift(liquidity, -80).plus(dx.multipliedBy(currSqrtPrice));

    return Math2.floor(num.dividedBy(denom));
  }

  /**
   * Returns the new square root price when swapping Y for X
   * @param currSqrtPrice Old or current squared price
   * @param dy Amount of token y being swapped
   * @param liquidity Current liquidity
   */
  static sqrtPriceMoveY(currSqrtPrice: BigNumber, dy: BigNumber, liquidity: BigNumber): BigNumber {
    return Math2.ceil(Math2.bitShift(dy, -80).dividedBy(liquidity)).plus(currSqrtPrice);
  }

  /**
   * Computes the new tick after a swap
   * @param currTickIndex Index the present swap step
   * @param oldSqrtPrice Old price before swap
   * @param newSqrtPrice Price after swap step
   */
  static calcNewCurrTickIndex(currTickIndex: number, oldSqrtPrice: BigNumber, newSqrtPrice: BigNumber): number {
    function fixCurrTickIndex(currTickIndexNew: number, currTickIndexPrice: BigNumber): number {
      if (newSqrtPrice.isLessThan(currTickIndexPrice)) {
        const prevTickIndex = currTickIndexNew - 1;
        const prevIndexSqrtPrice = Tick.computeSqrtPriceFromTick(prevTickIndex);
        return fixCurrTickIndex(prevTickIndex, prevIndexSqrtPrice);
      } else {
        const nextTickIndex = currTickIndexNew + 1;
        const nextIndexSqrtPrice = Tick.computeSqrtPriceFromTick(nextTickIndex);
        if (nextIndexSqrtPrice.isLessThanOrEqualTo(newSqrtPrice)) {
          return fixCurrTickIndex(nextTickIndex, nextIndexSqrtPrice);
        } else {
          return currTickIndexNew;
        }
      }
    }

    const x = newSqrtPrice;
    const y = oldSqrtPrice;

    const tenX = x.multipliedBy(10);
    if (tenX.isLessThan(y.multipliedBy(7)) || tenX.isGreaterThan(y.multipliedBy(15))) {
      throw "Log out of bounds";
    }
    const xPlusY = x.plus(y);
    const num = x
      .minus(y)
      .multipliedBy(xPlusY)
      .multipliedBy(60003);
    const denom = xPlusY.multipliedBy(xPlusY).plus(x.multipliedBy(y).multipliedBy(2));

    const delta = Math2.floor(num.dividedBy(denom)).toNumber();
    const newTickIndex = currTickIndex + delta;
    return fixCurrTickIndex(newTickIndex, Tick.computeSqrtPriceFromTick(newTickIndex));
  }
}
