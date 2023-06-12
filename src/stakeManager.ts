import { TransferParams } from "@taquito/taquito";

import { Contract } from "./types";

export interface StakeOptions {
  incentiveId: number;
  tokenId: number;
}

export type UnstakeOptions = StakeOptions;

export abstract class StakeManager {
  /**
   * Builds transactions params for staking a position in a farm
   * @param farm A taquito contract instance of the farm contract
   * @param options Mandatory options for staking a position
   */
  static stake(farm: Contract, options: StakeOptions): TransferParams {
    return farm.methodsObject
      .stake({
        0: options.tokenId,
        1: options.incentiveId,
      })
      .toTransferParams();
  }

  /**
   * Builds transactions params for unstaking a position off a farm
   * @param farm A taquito contract instance of the farm contract
   * @param options Mandatory options for unstaking a position
   */
  static unstake(farm: Contract, options: UnstakeOptions): TransferParams {
    return farm.methodsObject
      .unstake({
        0: options.tokenId,
        1: options.incentiveId,
      })
      .toTransferParams();
  }

  /**
   * Builds transactions params for withdrawing a token deposit off the farm
   * @param farm A taquito contract instance of the farm contract
   * @param tokenId token-id of the position token
   */
  static withdraw(farm: Contract, tokenId: number): TransferParams {
    return farm.methodsObject.withdraw(tokenId).toTransferParams();
  }
}
