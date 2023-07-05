import BigNumber from "bignumber.js";

import { Math2 } from "../utils";
import { Incentive } from "../types";

export class Stake {
  public readonly incentive: Incentive;
  public readonly liquidity: BigNumber;
  public readonly secondsPerLiquidityInsideLast: BigNumber;

  constructor(incentive: Incentive, liquidity: BigNumber, secondsPerLiquidityInside: BigNumber) {
    this.incentive = incentive;
    this.liquidity = liquidity;
    this.secondsPerLiquidityInsideLast = secondsPerLiquidityInside;
  }

  /**
   * Computes unclaimed reward for the farm
   * @param secondsPerLiquidityInside The latest cumulatives value for seconds weighted 1 / L
   */
  computeUnclaimedReward(secondsPerLiquidityInside: BigNumber) {
    const secondsPerLiquidityInsideDiff = secondsPerLiquidityInside.minus(this.secondsPerLiquidityInsideLast);
    const secondsInside = secondsPerLiquidityInsideDiff.multipliedBy(this.liquidity);

    const now = Math.floor(new Date().getTime() / 1000);

    const totalSecondsForReward =
      (now < this.incentive.endTime ? this.incentive.endTime : now) - this.incentive.startTime;
    const totalSecondsUnclaimed = Math2.bitShift(new BigNumber(totalSecondsForReward), -128).minus(
      this.incentive.totalSecondsClaimed
    );
    const reward = Math2.floor(
      this.incentive.totalRewardUnclaimed.multipliedBy(secondsInside).dividedBy(totalSecondsUnclaimed)
    );

    return BigNumber.min(this.incentive.totalRewardUnclaimed, reward);
  }
}
