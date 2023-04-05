import { DefaultContractType, WalletContract } from "@taquito/taquito";
import BigNumber from "bignumber.js";

export type Contract = DefaultContractType | WalletContract;

export interface FixedPoint {
  v: BigNumber;
  offset: number;
}

export interface BalanceNat {
  x: BigNumber;
  y: BigNumber;
}

export interface Ladder {
  [key: number]: FixedPoint;
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
}
