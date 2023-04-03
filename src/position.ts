import { DefaultContractType, TransactionOperation } from "@taquito/taquito";

import { Liquidity } from "./utils";
import { Tick } from "./utils/tick";
import { BalanceNat, PoolStorage, TickIndex } from "./types";

export interface SetPositionOptions {
  /**
   * Tick index at lower price boundary
   */
  lowerTickIndex: TickIndex;

  /**
   * Tick index at upper price boundary
   */
  upperTickIndex: TickIndex;

  /**
   * Closest tick index less than or equal to the provided lower tick
   */
  lowerTickWitness: TickIndex;

  /**
   * Closest tick index less than or equal to the provided upper tick
   */
  upperTickWitness: TickIndex;

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
  constructor() {}

  /**
   * Builds a transaction operation for setting a new position in a Plenty v3 pool
   * @param pool A taquito contract instance of the pool in which liquidity is being added to
   * @param options Mandatory options for setting up a new position
   */
  public static async setPositionOp(
    pool: DefaultContractType,
    options: SetPositionOptions
  ): Promise<TransactionOperation> {
    try {
      const storage = await pool.storage<PoolStorage>();

      const poolTickSpacing = storage.constants.tick_spacing.toNumber();

      options.lowerTickIndex = Tick.nearestUsableTick(options.lowerTickIndex, poolTickSpacing);
      options.upperTickIndex = Tick.nearestUsableTick(options.upperTickIndex, poolTickSpacing);

      const sqrtPriceAx80 = Tick.computeSqrtPriceFromTick(options.lowerTickIndex);
      const sqrtPriceBx80 = Tick.computeSqrtPriceFromTick(options.upperTickIndex);

      const liquidity = Liquidity.computeLiquidityFromAmount(options.tokensToContribute, sqrtPriceAx80, sqrtPriceBx80);

      return await pool.methodsObject
        .set_position({
          lower_tick_index: options.lowerTickIndex,
          upper_tick_index: options.upperTickIndex,
          lower_tick_witness: options.lowerTickWitness,
          upper_tick_witness: options.upperTickWitness,
          liquidity: liquidity,
          deadline: options.deadline,
          maximum_tokens_contributed: options.tokensToContribute,
        })
        .send();
    } catch (err) {
      throw err;
    }
  }
}
