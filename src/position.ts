import BigNumber from "bignumber.js";
import { DefaultContractType, TransferParams, WalletContract } from "@taquito/taquito";

import { Liquidity, Tick } from "./utils";
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
   * Position's initial liquidity
   */
  liquidity: BigNumber;

  /**
   * Timestamp post which the liquidity transaction will be rejected by the pool
   */
  deadline: number;

  /**
   * Maximum number of individual tokens contributed
   */
  maximumTokensContributed: BalanceNat;
}

export interface UpdatePositionOptions {
  /**
   * Big-map key id of the position being updated
   */
  positionId: number;

  /**
   * Liquidity being added or removed
   */
  liquidityDelta: BigNumber;

  /**
   * address to which removed amount of token x must be sent
   */
  toX: string;

  /**
   * address to which removed amount of token y must be sent
   */
  toY: string;

  /**
   * Timestamp post which the liquidity transaction will be rejected by the pool
   */
  deadline: number;

  /**
   * Maximum number of individual tokens contributed
   */
  maximumTokensContributed: BalanceNat;
}

export abstract class Position {
  /**
   * Builds transaction params for setting a new position in a Plenty v3 pool.
   * If tick spacing is not respected, the given ticks are readjusted based on the pool's spacing.
   * @param pool A taquito contract instance of the pool in which liquidity is being added to
   * @param options Mandatory options for setting up a new position
   */
  static async setPositionOp(
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

      const liquidity = Liquidity.computeLiquidityFromAmount(
        options.maximumTokensContributed,
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
          liquidity: liquidity.decimalPlaces(0),
          deadline: options.deadline,
          maximum_tokens_contributed: {
            x: options.maximumTokensContributed.x.decimalPlaces(0),
            y: options.maximumTokensContributed.y.decimalPlaces(0),
          },
        })
        .toTransferParams();
    } catch (err) {
      throw err;
    }
  }

  /**
   * Builds transaction params for updating and existing position in a Plenty v3 pool.
   * @param pool  A taquito contract instance of the pool in which the position exists
   * @param options Mandatory options for updating a new position
   */
  static updatePositionOp(pool: DefaultContractType | WalletContract, options: UpdatePositionOptions): TransferParams {
    return pool.methodsObject
      .update_position({
        position_id: options.positionId,
        liquidity_delta: options.liquidityDelta.decimalPlaces(0),
        to_x: options.toX,
        to_y: options.toY,
        deadline: options.deadline,
        maximum_tokens_contributed: {
          x: options.maximumTokensContributed.x.decimalPlaces(0),
          y: options.maximumTokensContributed.y.decimalPlaces(0),
        },
      })
      .toTransferParams();
  }
}
