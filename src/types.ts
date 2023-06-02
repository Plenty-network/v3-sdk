import BigNumber from "bignumber.js";
import { DefaultContractType, MichelsonMap, WalletContract } from "@taquito/taquito";

export type Contract = DefaultContractType | WalletContract;

export enum TokenStandard {
  FA12 = "FA1.2",
  FA2 = "FA2",
}

export interface Token {
  address: string;
  tokenId?: number;
  standard: TokenStandard;
  decimals: number;
}

export interface FixedPoint {
  v: BigNumber;
  offset: number;
}

export interface BalanceNat {
  x: BigNumber;
  y: BigNumber;
}

export interface BalanceNatx128 {
  x: BigNumber;
  y: BigNumber;
}

export interface Ladder {
  [key: number]: FixedPoint;
}

export interface TickElement {
  index: number;
  prevIndex: number;
  nextIndex: number;
  sqrtPrice: BigNumber;
  liquidityNet: BigNumber;
}

// Fields not accessed in the SDK are not included in the type
export interface PoolStorage {
  liquidity: BigNumber;
  sqrt_price: BigNumber;
  curr_tick_index: BigNumber;
  curr_tick_witness: BigNumber;
  constants: {
    tick_spacing: BigNumber;
  };
  positions: MichelsonMap<any, any>;
}
