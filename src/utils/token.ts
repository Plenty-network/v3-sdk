import BigNumber from "bignumber.js";
import { TransferParams } from "@taquito/taquito";
import { Contract } from "../types";

export interface ApproveFA12Options {
  spender: string;
  value: BigNumber | number | string;
}

export interface OperatorKey {
  owner: string;
  operator: string;
  token_id: number;
}

export type UpdateOperatorFA2Options = Array<{ [key: string]: OperatorKey }>;

export abstract class Token {
  /**
   * Builds transaction params for token approval call to an FA1.2 token contract
   * @param token Taquito contract instance of an FA1.2 contract
   * @param options parameters for TZIP-7 `approve` EP
   * @returns
   */
  static approveFA12(token: Contract, options: ApproveFA12Options): TransferParams {
    try {
      return token.methodsObject.approve(options).toTransferParams();
    } catch (err) {
      throw err;
    }
  }

  /**
   * Builds transaction params for updating token operator in an FA2 token contract
   * @param token Taquito contract instance of an FA2 contract
   * @param options parameters for TZIP-12 `update_operators` EP
   * @returns
   */
  static updateOperatorsFA2(token: Contract, options: UpdateOperatorFA2Options): TransferParams {
    try {
      return token.methodsObject.update_operators(options).toTransferParams();
    } catch (err) {
      throw err;
    }
  }
}
