import BigNumber from "bignumber.js";
import { TransferParams } from "@taquito/taquito";

import { ZERO_VAL } from "./utils";
import { BalanceNat, Contract } from "./types";

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

export interface CollectFeeOptions {
  /**
   * Big-map key id of the position being updated
   */
  positionId: number;

  /**
   * address to which collected fee in token x must be sent
   */
  toX: string;

  /**
   * address to which collected fee in token y must be sent
   */
  toY: string;

  /**
   * Timestamp post which the fee collection transaction will be rejected by the pool
   */
  deadline: number;
}

export abstract class PositionManager {
  /**
   * Builds transaction params for setting a new position in a Plenty v3 pool.
   * @param pool A taquito contract instance of the pool in which liquidity is being added to
   * @param options Mandatory options for setting up a new position
   */
  static setPositionOp(pool: Contract, options: SetPositionOptions): TransferParams {
    return pool.methodsObject
      .set_position({
        lower_tick_index: options.lowerTickIndex,
        upper_tick_index: options.upperTickIndex,
        lower_tick_witness: options.lowerTickWitness,
        upper_tick_witness: options.upperTickWitness,
        liquidity: options.liquidity.decimalPlaces(0),
        deadline: options.deadline,
        maximum_tokens_contributed: {
          x: options.maximumTokensContributed.x.decimalPlaces(0),
          y: options.maximumTokensContributed.y.decimalPlaces(0),
        },
      })
      .toTransferParams();
  }

  /**
   * Builds transaction params for updating and existing position in a Plenty v3 pool.
   * @param pool A taquito contract instance of the pool in which the position exists
   * @param options Mandatory options for updating a new position
   */
  static updatePositionOp(pool: Contract, options: UpdatePositionOptions): TransferParams {
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

  /**
   * Builds transaction params for collecting fees from an existing position
   * @param pool A taquito contract instance of the pool in which the position exists
   * @param options Mandatory options for collecting the fees of a position
   */
  static collectFeesOp(pool: Contract, options: CollectFeeOptions): TransferParams {
    return this.updatePositionOp(pool, {
      ...options,
      liquidityDelta: ZERO_VAL,
      maximumTokensContributed: { x: ZERO_VAL, y: ZERO_VAL },
    });
  }
}
