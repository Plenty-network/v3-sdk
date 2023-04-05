import { DefaultContractType, TransferParams, WalletContract } from "@taquito/taquito";

import { Liquidity } from "./utils";
import { Tick } from "./utils/tick";
import { BalanceNat, PoolStorage } from "./types";

export interface SetPositionOptions {
  /**
   * Tick index at lower price boundary
   */
  lowerTickIndex: number;

  /**
   * Tick index at upper price boundary
   */
  upperTickIndex: number;

  /**
   * Closest tick index less than or equal to the provided lower tick
   */
  lowerTickWitness: number;

  /**
   * Closest tick index less than or equal to the provided upper tick
   */
  upperTickWitness: number;

  /**
   * Maximum number of individual tokens contributed
   */
  tokensToContribute: BalanceNat;

  /**
   * Timestamp post which the liquidity transaction will be rejected by the pool
   */
  deadline: number;
}

export abstract class Position {
  /**
   * Builds transaction params for setting a new position in a Plenty v3 pool.
   * If tick spacing is not respected, the given ticks are readjusted based on the pool's spacing.
   * @param pool A taquito contract instance of the pool in which liquidity is being added to
   * @param options Mandatory options for setting up a new position
   */
  public static async setPositionOp(
    pool: DefaultContractType | WalletContract,
    options: SetPositionOptions
  ): Promise<TransferParams> {
    try {
      const storage = await pool.storage<PoolStorage>();

      const poolTickSpacing = storage.constants.tick_spacing.toNumber();
      const sqrtPriceCx80 = storage.sqrt_price; // Current price in the pool

      options.lowerTickIndex = Tick.nearestUsableTick(options.lowerTickIndex, poolTickSpacing);
      options.upperTickIndex = Tick.nearestUsableTick(options.upperTickIndex, poolTickSpacing);

      const sqrtPriceAx80 = Tick.computeSqrtPriceFromTick(options.lowerTickIndex);
      const sqrtPriceBx80 = Tick.computeSqrtPriceFromTick(options.upperTickIndex);

      const liquidity = Liquidity.computePositionLiquidity(
        options.tokensToContribute,
        sqrtPriceCx80,
        sqrtPriceAx80,
        sqrtPriceBx80
      );

      return pool.methodsObject
        .set_position({
          lower_tick_index: options.lowerTickIndex,
          upper_tick_index: options.upperTickIndex,
          lower_tick_witness: options.lowerTickWitness,
          upper_tick_witness: options.upperTickWitness,
          liquidity: liquidity.toFixed(0),
          deadline: options.deadline,
          maximum_tokens_contributed: options.tokensToContribute,
        })
        .toTransferParams();
    } catch (err) {
      throw err;
    }
  }
}
