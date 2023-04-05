import { Math2 } from "./math2";
import { BalanceNat, BalanceNatx128 } from "../types";

export interface ComputePositionFeeOptions {
  /**
   * global fee growth
   */
  global: BalanceNatx128;

  /**
   * fee growth outside lower tick
   */
  lowerTickOutsideLast: BalanceNatx128;

  /**
   * fee growth outside upper tick
   */
  upperTickOutsideLast: BalanceNatx128;

  /**
   * fee growth inside the position
   */
  positionInsideLast: BalanceNatx128;

  /**
   * current tick index in the pool contract
   */
  currentTickIndex: number;

  /**
   * Tick at upper price boundary of the position
   */
  lowerTickIndex: number;

  /**
   * Tick at lower price boundary of the position
   */
  upperTickIndex: number;
}

export abstract class Fee {
  /**
   * Computes uncollected fee for a specific position.
   * @param options Options for computing the fee of a specific position
   */
  static computePositionFee(options: ComputePositionFeeOptions): BalanceNat {
    let feeAbove: BalanceNatx128;
    let feeBelow: BalanceNatx128;

    if (options.currentTickIndex >= options.upperTickIndex) {
      feeAbove = {
        x: options.global.x.minus(options.upperTickOutsideLast.x),
        y: options.global.y.minus(options.upperTickOutsideLast.y),
      };
    } else {
      feeAbove = options.upperTickOutsideLast;
    }

    if (options.currentTickIndex >= options.lowerTickIndex) {
      feeBelow = options.lowerTickOutsideLast;
    } else {
      feeBelow = {
        x: options.global.x.minus(options.lowerTickOutsideLast.x),
        y: options.global.y.minus(options.lowerTickOutsideLast.y),
      };
    }

    const tickRangeFees = {
      x: options.global.x.minus(feeAbove.x).minus(feeBelow.x),
      y: options.global.y.minus(feeAbove.y).minus(feeBelow.y),
    };

    return {
      x: Math2.bitShift(tickRangeFees.x.minus(options.positionInsideLast.x), 128),
      y: Math2.bitShift(tickRangeFees.y.minus(options.positionInsideLast.y), 128),
    };
  }
}
