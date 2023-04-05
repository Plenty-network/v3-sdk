import BigNumber from "bignumber.js";

import { Math2 } from "./math2";
import { FixedPoint } from "../types";
import { NEGATIVE_LADDER, POSITIVE_LADDER, Q80 } from "./constants";

export abstract class Tick {
  constructor() {}

  /**
   * Computes greatest tick less than or equals to the provided tick based on the spacing
   * @param tick The tick to be adjusted
   * @param space Tickspacing of the pool
   */
  static nearestUsableTick(tick: number, space: number): number {
    return Math.floor(tick / space) * space;
  }

  /**
   * Computes the sqrt price (precision 2^80) through binary exponentiation using a predefined ladder
   * @param tick Tick index for which the corressponding sqrt price is required
   */
  static computeSqrtPriceFromTick(tick: number): BigNumber {
    const ladder = tick < 0 ? NEGATIVE_LADDER : POSITIVE_LADDER;

    // Following the recursive logic as in the contract for consistency
    function halfBpsPowRec(tick: number, acc: FixedPoint, ladderKey: number): FixedPoint {
      if (tick == 0) {
        return acc;
      } else {
        const [half, rem] = Math2.euclideanDivision(tick, 2);
        if (rem == 0) {
          return halfBpsPowRec(half, acc, ladderKey + 1);
        } else {
          const newAcc = Math2.fixedPointMul(acc, ladder[ladderKey]);
          return halfBpsPowRec(half, newAcc, ladderKey + 1);
        }
      }
    }

    const product = halfBpsPowRec(Math.abs(tick), { v: new BigNumber(1), offset: 0 }, 0);
    return Math2.bitShift(product.v, -80 - product.offset);
  }

  /**
   * Given the sqrtPricex80, this computes the greatest tick i for which e^(0.00005 * i) <= sqrtPricex80
   * @param sqrtPricex80 sqrt price (Y/X) in fixed point format with offset as +80
   * @param tickSpace tick-spacing of the pool
   */
  static computeTickFromSqrtPrice(sqrtPricex80: BigNumber, tickSpace: number): number {
    // Remove precision multiplier
    const sqrtPrice = sqrtPricex80.dividedBy(Q80);

    // Derived from sqrt(P) = e^(0.00005 * i)
    const tick = Math.floor(20000 * Math.log(sqrtPrice.toNumber()));

    // Adjust to nearest tick space
    return this.nearestUsableTick(tick, tickSpace);
  }
}
