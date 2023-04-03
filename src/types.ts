import BigNumber from "bignumber.js";

export interface FixedPoint {
  v: BigNumber;
  offset: number;
}

export interface TickIndex {
  i: number;
}

export interface TickIndexBN {
  i: BigNumber;
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
  sqrt_price: { x80: BigNumber };
  curr_tick_index: TickIndexBN;
  curr_tick_witness: TickIndexBN;
  constants: {
    tick_spacing: BigNumber;
  };
}
