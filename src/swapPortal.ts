import BigNumber from "bignumber.js";
import { TransferParams } from "@taquito/taquito";

import { Contract } from "./types";

export interface SwapXToYOptions {
  /**
   * Amount of token x being swapped for token y
   */
  tokenXIn: BigNumber;

  /**
   * Operation reverts if amount of token y received is less than this number
   */
  minTokenYOut: BigNumber;

  /**
   * Operation reverts beyond this timestamp
   * Default value is 15 minutes from current time
   */
  deadline?: number;

  /**
   * Tezos address to which the output tokens should be sent
   */
  recipient: string;
}

export interface SwapYToXOptions {
  /**
   * Amount of token y being swapped for token x
   */
  tokenYIn: BigNumber;

  /**
   * Operation reverts if amount of token x received is less than this number
   */
  minTokenXOut: BigNumber;

  /**
   * Operation reverts beyond this timestamp
   * Default value is 15 minutes from current time
   */
  deadline?: number;

  /**
   * Tezos address to which the output tokens should be sent
   */
  recipient: string;
}

export abstract class SwapPortal {
  /**
   * Builds transaction params to perform a swap from token x to token y
   * @param pool A taquito contract instance of the pool through which the swap happens
   * @param options Options for performing the token x to y swap
   */
  static swapXToY(pool: Contract, options: SwapXToYOptions): TransferParams {
    if (!options.deadline) {
      options.deadline = Math.floor(Date.now() / 1000) + 900; // 15 minutes
    }

    return pool.methodsObject
      .x_to_y({
        dx: options.tokenXIn,
        deadline: options.deadline,
        min_dy: options.minTokenYOut,
        to_dy: options.recipient,
      })
      .toTransferParams();
  }

  /**
   * Builds transaction params to perform a swap from token y to token x
   * @param pool A taquito contract instance of the pool through which the swap happens
   * @param options Options for performing the token y to x swap
   */
  static swapYToX(pool: Contract, options: SwapYToXOptions): TransferParams {
    if (!options.deadline) {
      options.deadline = Math.floor(Date.now() / 1000) + 900; // 15 minutes
    }

    return pool.methodsObject
      .y_to_x({
        dy: options.tokenYIn,
        deadline: options.deadline,
        min_dx: options.minTokenXOut,
        to_dx: options.recipient,
      })
      .toTransferParams();
  }
}
