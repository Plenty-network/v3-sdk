import BigNumber from "bignumber.js";
import { ContractAbstraction, DefaultContractType, MichelsonMap, Wallet, WalletContract } from "@taquito/taquito";

export type Contract = DefaultContractType | WalletContract | ContractAbstraction<Wallet>;

export interface Token {
  address: string;
  tokenId?: number;
  decimals: number;
}

export interface Fa12 {
  fa12: string;
}

export interface Fa2 {
  fa2: {
    address: string;
    token_id: BigNumber;
  };
}

export type TokenOption = Fa12 | Fa2;

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

export interface Incentive {
  startTime: number; // Timestamp
  endTime: number; // Timestamp
  totalRewardUnclaimed: BigNumber;
  totalSecondsClaimed: BigNumber;
}
