import BigNumber from "bignumber.js";

import { Pool } from "./pool";
import { Fee, Liquidity, Tick } from "../utils";
import { BalanceNat, BalanceNatx128 } from "../types";

export class Position {
  public readonly pool: Pool;
  public readonly lowerTickIndex: number;
  public readonly upperTickIndex: number;
  public readonly liquidity: BigNumber;

  private _feeInsidelast?: BalanceNatx128;

  constructor(
    pool: Pool,
    lowerTickIndex: number,
    upperTickIndex: number,
    liquidity: BigNumber,
    feeInsideLast?: BalanceNatx128
  ) {
    this.pool = pool;
    this.lowerTickIndex = lowerTickIndex;
    this.upperTickIndex = upperTickIndex;
    this.liquidity = liquidity;
    this._feeInsidelast = feeInsideLast;
  }

  /**
   * Returns the token amounts received (without fees) when all the liquidity in this position is burnt
   */
  computeTokenAmounts(): BalanceNat {
    return Liquidity.computeAmountFromLiquidity(
      this.liquidity,
      Tick.computeSqrtPriceFromTick(this.pool.currTickIndex),
      Tick.computeSqrtPriceFromTick(this.lowerTickIndex),
      Tick.computeSqrtPriceFromTick(this.upperTickIndex)
    );
  }

  /**
   * Computes pending fee collected by the position
   * @param globalFeeGrowth The global variable `fee_growth`
   * @param lowerTickOutsideLast fee growth outside lower tick
   * @param upperTickOutsideLast fee growth outside upper tick
   */
  computeFees(
    globalFeeGrowth: BalanceNatx128,
    lowerTickOutsideLast: BalanceNatx128,
    upperTickOutsideLast: BalanceNatx128
  ): BalanceNat {
    if (this._feeInsidelast) {
      return Fee.computePositionFee({
        global: globalFeeGrowth,
        lowerTickOutsideLast,
        upperTickOutsideLast,
        positionInsideLast: this._feeInsidelast,
        currentTickIndex: this.pool.currTickIndex,
        lowerTickIndex: this.lowerTickIndex,
        upperTickIndex: this.upperTickIndex,
        liquidity: this.liquidity,
      });
    } else {
      throw "feeInsideLast NOT INITIALISED";
    }
  }
}
