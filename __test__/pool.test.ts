import BigNumber from "bignumber.js";

import { Pool, Price, Tick, TickElement, ZERO_VAL } from "../dist";

describe("swap estimation", () => {
  const ticks: { [key: string]: TickElement } = {
    "-275450": {
      index: -275450,
      nextIndex: -275360,
      prevIndex: -275730,
      sqrtPrice: new BigNumber("1262056799839311110"),
      liquidityNet: new BigNumber("-108848716561346"),
    },
    "-275730": {
      index: -275730,
      nextIndex: -275450,
      prevIndex: -275830,
      sqrtPrice: new BigNumber("1244511111041790933"),
      liquidityNet: new BigNumber("-313671103822858"),
    },
    "-275830": {
      index: -275830,
      nextIndex: -275730,
      prevIndex: -276120,
      sqrtPrice: new BigNumber("1238304085980531949"),
      liquidityNet: new BigNumber("363390184182781"),
    },
  };

  const pool = new Pool(
    -275611,
    -275730,
    10,
    new BigNumber("1251963215603107302"),
    5,
    new BigNumber("1259480907161538")
  );

  it("swaps x to y", async () => {
    const step = await pool.estimateSwapXToY(new BigNumber(10 ** 18), (tick: number) => {
      return new Promise((resolve, _) => {
        resolve(ticks[tick.toString()]);
      });
    });

    expect(step.dx).toEqual(ZERO_VAL);
    expect(step.dy).toEqual(new BigNumber("1071050"));
  });

  it("swaps y to x", async () => {
    const step = await pool.estimateSwapYToX(new BigNumber(10 ** 6), (tick: number) => {
      return new Promise((resolve, _) => {
        resolve(ticks[tick.toString()]);
      });
    });

    expect(step.dx).toEqual(new BigNumber("931250017954393654"));
    expect(step.dy).toEqual(ZERO_VAL);
  });

  it("", () => {
    console.log(
      Price.computeRealPriceFromSqrtPrice(
        Tick.computeSqrtPriceFromTick(-114600),
        { address: "KT1SjXiUX63QvdNMcM2m492f7kuf8JxXRLp4", decimals: 8 },
        { address: "KT1GBgCd5dk7v4TSzWvtk1X64TxMyG4r7eRX", decimals: 6, tokenId: 0 }
      ).toNumber()
    );
  });
});
