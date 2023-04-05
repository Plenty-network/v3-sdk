import BigNumber from "bignumber.js";
import { InMemorySigner } from "@taquito/signer";
import { OpKind, TezosToolkit } from "@taquito/taquito";
import { Tick, Math2, Token, Position, SetPositionOptions } from "../src";

import { config } from "./utils/config";

// For block confirmation
jest.setTimeout(30000);

const tezos = new TezosToolkit(config.rpcURL);
tezos.setProvider({ signer: new InMemorySigner(config.pk as string) });

test("position - sets a new position in both token x and y", async () => {
  const pool = await tezos.contract.at(config.pool);
  const tokenX = await tezos.wallet.at(config.tokenX.address);
  const tokenY = await tezos.contract.at(config.tokenX.address);

  const lowerPriceBoundary = new BigNumber(0.98).multipliedBy(config.tokenY.decimals).dividedBy(config.tokenX.decimals);
  const upperPriceBoundary = new BigNumber(1.02).multipliedBy(config.tokenY.decimals).dividedBy(config.tokenX.decimals);

  const sqrtPriceAx80 = Math2.sqrt(Math2.bitShift(lowerPriceBoundary, -160));
  const sqrtPriceBx80 = Math2.sqrt(Math2.bitShift(upperPriceBoundary, -160));

  const lowerTickIndex = Tick.computeTickFromSqrtPrice(sqrtPriceAx80, 10);
  const upperTickIndex = Tick.computeTickFromSqrtPrice(sqrtPriceBx80, 10);

  const setPositionOptions: SetPositionOptions = {
    lowerTickIndex,
    upperTickIndex,
    lowerTickWitness: -1048575,
    upperTickWitness: -1048575,
    tokensToContribute: {
      x: new BigNumber(2 * config.tokenX.decimals),
      y: new BigNumber(2 * config.tokenY.decimals),
    },
    deadline: Math.floor(new Date().getTime() / 1000) + 9000,
  };

  const setPositionTransferParams = await Position.setPositionOp(pool, setPositionOptions);

  const op = await tezos.contract
    .batch([
      {
        kind: OpKind.TRANSACTION,
        ...Token.updateOperatorsFA2(tokenX, [
          {
            add_operator: {
              owner: await tezos.wallet.pkh(),
              token_id: config.tokenX.tokenId,
              operator: pool.address,
            },
          },
        ]),
      },
      {
        kind: OpKind.TRANSACTION,
        ...Token.updateOperatorsFA2(tokenY, [
          {
            add_operator: {
              owner: await tezos.wallet.pkh(),
              token_id: config.tokenY.tokenId,
              operator: pool.address,
            },
          },
        ]),
      },
      {
        kind: OpKind.TRANSACTION,
        ...setPositionTransferParams,
      },
    ])
    .send();
  await op.confirmation();

  expect("applied").toEqual("applied");
});

test("position - sets a new position only in token x", async () => {
  const pool = await tezos.contract.at(config.pool);
  const tokenX = await tezos.wallet.at(config.tokenX.address);
  const tokenY = await tezos.contract.at(config.tokenX.address);

  const lowerPriceBoundary = new BigNumber(0.9).multipliedBy(config.tokenY.decimals).dividedBy(config.tokenX.decimals);
  const upperPriceBoundary = new BigNumber(0.95).multipliedBy(config.tokenY.decimals).dividedBy(config.tokenX.decimals);

  const sqrtPriceAx80 = Math2.sqrt(Math2.bitShift(lowerPriceBoundary, -160));
  const sqrtPriceBx80 = Math2.sqrt(Math2.bitShift(upperPriceBoundary, -160));

  const lowerTickIndex = Tick.computeTickFromSqrtPrice(sqrtPriceAx80, 10);
  const upperTickIndex = Tick.computeTickFromSqrtPrice(sqrtPriceBx80, 10);

  const setPositionOptions: SetPositionOptions = {
    lowerTickIndex,
    upperTickIndex,
    lowerTickWitness: -1048575,
    upperTickWitness: -1048575,
    tokensToContribute: {
      x: new BigNumber(2 * config.tokenX.decimals),
      y: new BigNumber(2 * config.tokenY.decimals),
    },
    deadline: Math.floor(new Date().getTime() / 1000) + 9000,
  };

  const setPositionTransferParams = await Position.setPositionOp(pool, setPositionOptions);

  const op = await tezos.contract
    .batch([
      {
        kind: OpKind.TRANSACTION,
        ...Token.updateOperatorsFA2(tokenX, [
          {
            add_operator: {
              owner: await tezos.wallet.pkh(),
              token_id: config.tokenX.tokenId,
              operator: pool.address,
            },
          },
        ]),
      },
      {
        kind: OpKind.TRANSACTION,
        ...Token.updateOperatorsFA2(tokenY, [
          {
            add_operator: {
              owner: await tezos.wallet.pkh(),
              token_id: config.tokenY.tokenId,
              operator: pool.address,
            },
          },
        ]),
      },
      {
        kind: OpKind.TRANSACTION,
        ...setPositionTransferParams,
      },
    ])
    .send();
  await op.confirmation();

  expect("applied").toEqual("applied");
});

test("position - sets a new position only in token y", async () => {
  const pool = await tezos.contract.at(config.pool);
  const tokenX = await tezos.wallet.at(config.tokenX.address);
  const tokenY = await tezos.contract.at(config.tokenX.address);

  const lowerPriceBoundary = new BigNumber(1.05).multipliedBy(config.tokenY.decimals).dividedBy(config.tokenX.decimals);
  const upperPriceBoundary = new BigNumber(1.1).multipliedBy(config.tokenY.decimals).dividedBy(config.tokenX.decimals);

  const sqrtPriceAx80 = Math2.sqrt(Math2.bitShift(lowerPriceBoundary, -160));
  const sqrtPriceBx80 = Math2.sqrt(Math2.bitShift(upperPriceBoundary, -160));

  const lowerTickIndex = Tick.computeTickFromSqrtPrice(sqrtPriceAx80, 10);
  const upperTickIndex = Tick.computeTickFromSqrtPrice(sqrtPriceBx80, 10);

  const setPositionOptions: SetPositionOptions = {
    lowerTickIndex,
    upperTickIndex,
    lowerTickWitness: -1048575,
    upperTickWitness: -1048575,
    tokensToContribute: {
      x: new BigNumber(2 * config.tokenX.decimals),
      y: new BigNumber(2 * config.tokenY.decimals),
    },
    deadline: Math.floor(new Date().getTime() / 1000) + 9000,
  };

  const setPositionTransferParams = await Position.setPositionOp(pool, setPositionOptions);

  const op = await tezos.contract
    .batch([
      {
        kind: OpKind.TRANSACTION,
        ...Token.updateOperatorsFA2(tokenX, [
          {
            add_operator: {
              owner: await tezos.wallet.pkh(),
              token_id: config.tokenX.tokenId,
              operator: pool.address,
            },
          },
        ]),
      },
      {
        kind: OpKind.TRANSACTION,
        ...Token.updateOperatorsFA2(tokenY, [
          {
            add_operator: {
              owner: await tezos.wallet.pkh(),
              token_id: config.tokenY.tokenId,
              operator: pool.address,
            },
          },
        ]),
      },
      {
        kind: OpKind.TRANSACTION,
        ...setPositionTransferParams,
      },
    ])
    .send();
  await op.confirmation();

  expect("applied").toEqual("applied");
});
