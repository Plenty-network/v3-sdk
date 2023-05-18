import BigNumber from "bignumber.js";

import { FixedPoint } from "../types";

export abstract class Math2 {
  /**
   * Computes floor(sqrt(value))
   * @param val the value for which to compute the square root, rounded down
   */
  static sqrt(val: BigNumber): BigNumber {
    let x0 = val;
    let x1 = val.dividedBy(2).plus(1);

    while (x1.isLessThan(x0)) {
      x0 = x1;
      x1 = x0.plus(val.dividedBy(x0)).dividedBy(2);
    }

    return this.floor(x1);
  }

  /**
   * Computes the quotient and remainder through euclidean division
   */
  static euclideanDivision(dividend: number, divisor: number): [number, number] {
    const q = Math.floor(Math.abs(dividend) / divisor);
    const r = dividend % divisor;
    return [q, r < 0 ? divisor + r : r];
  }

  /**
   * Fixed point multiplication in the format used in the smart contracts
   */
  static fixedPointMul(fp1: FixedPoint, fp2: FixedPoint): FixedPoint {
    return {
      v: fp1.v.multipliedBy(fp2.v),
      offset: fp1.offset + fp2.offset,
    };
  }

  /**
   * Performs a logical bitshift on `num`. If `places` is +ve a right shift is performed
   * otherwise, a left shift.
   */
  static bitShift(num: BigNumber, places: number): BigNumber {
    if (places > 0) {
      return num.dividedBy(new BigNumber(2).pow(places));
    } else {
      return num.multipliedBy(new BigNumber(2).pow(Math.abs(places)));
    }
  }

  /**
   * Ceils a given BigNumber
   * @param num BigNumber to be rounded up
   */
  static ceil(num: BigNumber): BigNumber {
    const BN = BigNumber.clone({ ROUNDING_MODE: BigNumber.ROUND_CEIL });
    return new BN(num).decimalPlaces(0);
  }

  /**
   * Floors a given BigNumber
   * @param num BigNumber to be floored
   */
  static floor(num: BigNumber): BigNumber {
    const BN = BigNumber.clone({ ROUNDING_MODE: BigNumber.ROUND_FLOOR });
    return new BN(num).decimalPlaces(0);
  }
}
