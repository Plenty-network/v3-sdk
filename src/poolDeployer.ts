import BigNumber from "bignumber.js";
import { TransferParams } from "@taquito/taquito";

import { Helpers } from "./utils/helpers";
import { Contract, Token } from "./types";
import { FEE_TO_SPACE, Price, Tick } from "./utils";

export interface DeployOptions {
  /**
   * The first token in the pair
   */
  tokenX: Token;

  /**
   * Second token in the pair
   */
  tokenY: Token;

  /**
   * Price Y / X in human readable form
   */
  realPrice: BigNumber;

  /**
   * Fee tier of the pool
   */
  feeBps: number;

  /**
   * Extra slots for cumulative values storage
   * Defaults to 0
   */
  extraSlots?: number;
}

export abstract class PoolDeployer {
  /**
   * Builds transaction params for deploying a new pool via the factory
   * @param pool A taquito contract instance of the factory
   * @param options Mandatory options for deploying a new pool
   */
  static deployPool(factory: Contract, options: DeployOptions): TransferParams {
    if (!options.extraSlots) {
      options.extraSlots = 0;
    }

    let [tx, ty] = [options.tokenX, options.tokenY];
    let rp = options.realPrice;

    if (!Helpers.isCorrectOrderToken(options.tokenX, options.tokenY)) {
      [tx, ty] = [options.tokenY, options.tokenX];
      rp = new BigNumber(1).dividedBy(options.realPrice);
    }

    return factory.methodsObject
      .deploy_pool({
        token_x:
          tx.tokenId !== undefined ? { fa2: { address: tx.address, token_id: tx.tokenId } } : { fa12: tx.address },
        token_y:
          ty.tokenId !== undefined ? { fa2: { address: ty.address, token_id: ty.tokenId } } : { fa12: ty.address },
        fee_bps: options.feeBps,
        initial_tick_index: Tick.computeTickFromSqrtPrice(
          Price.computeSqrtPriceFromRealPrice(rp, tx, ty),
          FEE_TO_SPACE[options.feeBps]
        ),
        extra_slots: options.extraSlots,
      })
      .toTransferParams();
  }
}
