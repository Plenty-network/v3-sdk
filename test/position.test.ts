import BigNumber from "bignumber.js";
import { InMemorySigner } from "@taquito/signer";
import { OpKind, TezosToolkit } from "@taquito/taquito";
import { Tick, Math2, Token, Position, SetPositionOptions, UpdatePositionOptions, Liquidity } from "../src";

import { config } from "./utils/config";
import { PoolStorage } from "../src/types";

// For block confirmation
jest.setTimeout(30000);

const tezos = new TezosToolkit(config.rpcURL);
tezos.setProvider({ signer: new InMemorySigner(config.pk as string) });

test("position - sets a new position in both token x and y", async () => {
  const pool = await tezos.contract.at(config.pool);
  const tokenX = await tezos.wallet.at(config.tokenX.address);
  const tokenY = await tezos.contract.at(config.tokenX.address);

  const lowerPriceBoundary = new BigNumber(0.8).multipliedBy(config.tokenY.decimals).dividedBy(config.tokenX.decimals);
  const upperPriceBoundary = new BigNumber(1.2).multipliedBy(config.tokenY.decimals).dividedBy(config.tokenX.decimals);

  const storage = await pool.storage<PoolStorage>();

  const sqrtPriceCx80 = storage.sqrt_price;
  const sqrtPriceAx80 = Math2.sqrt(Math2.bitShift(lowerPriceBoundary, -160));
  const sqrtPriceBx80 = Math2.sqrt(Math2.bitShift(upperPriceBoundary, -160));

  const lowerTickIndex = Tick.computeTickFromSqrtPrice(sqrtPriceAx80, 10);
  const upperTickIndex = Tick.computeTickFromSqrtPrice(sqrtPriceBx80, 10);

  const maximumTokensContributed = {
    x: new BigNumber(2 * config.tokenX.decimals),
    y: new BigNumber(2 * config.tokenY.decimals),
  };

  const liquidity = Liquidity.computeLiquidityFromAmount(
    maximumTokensContributed,
    sqrtPriceCx80,
    Tick.computeSqrtPriceFromTick(lowerTickIndex),
    Tick.computeSqrtPriceFromTick(upperTickIndex)
  );

  const setPositionOptions: SetPositionOptions = {
    lowerTickIndex,
    upperTickIndex,
    lowerTickWitness: -1048575,
    upperTickWitness: -1048575,
    liquidity,
    maximumTokensContributed,
    deadline: Math.floor(new Date().getTime() / 1000) + 9000,
  };

  const setPositionTransferParams = Position.setPositionOp(pool, setPositionOptions);

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

  const lowerPriceBoundary = new BigNumber(10).multipliedBy(config.tokenY.decimals).dividedBy(config.tokenX.decimals);
  const upperPriceBoundary = new BigNumber(11).multipliedBy(config.tokenY.decimals).dividedBy(config.tokenX.decimals);

  const storage = await pool.storage<PoolStorage>();

  const sqrtPriceCx80 = storage.sqrt_price;
  const sqrtPriceAx80 = Math2.sqrt(Math2.bitShift(lowerPriceBoundary, -160));
  const sqrtPriceBx80 = Math2.sqrt(Math2.bitShift(upperPriceBoundary, -160));

  const lowerTickIndex = Tick.computeTickFromSqrtPrice(sqrtPriceAx80, 10);
  const upperTickIndex = Tick.computeTickFromSqrtPrice(sqrtPriceBx80, 10);

  const maximumTokensContributed = {
    x: new BigNumber(2 * config.tokenX.decimals),
    y: new BigNumber(2 * config.tokenY.decimals),
  };

  const liquidity = Liquidity.computeLiquidityFromAmount(
    maximumTokensContributed,
    sqrtPriceCx80,
    Tick.computeSqrtPriceFromTick(lowerTickIndex),
    Tick.computeSqrtPriceFromTick(upperTickIndex)
  );

  const setPositionOptions: SetPositionOptions = {
    lowerTickIndex,
    upperTickIndex,
    lowerTickWitness: -1048575,
    upperTickWitness: -1048575,
    liquidity,
    maximumTokensContributed,
    deadline: Math.floor(new Date().getTime() / 1000) + 9000,
  };

  const setPositionTransferParams = Position.setPositionOp(pool, setPositionOptions);

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

  const lowerPriceBoundary = new BigNumber(0.05).multipliedBy(config.tokenY.decimals).dividedBy(config.tokenX.decimals);
  const upperPriceBoundary = new BigNumber(0.15).multipliedBy(config.tokenY.decimals).dividedBy(config.tokenX.decimals);

  const storage = await pool.storage<PoolStorage>();

  const sqrtPriceCx80 = storage.sqrt_price;
  const sqrtPriceAx80 = Math2.sqrt(Math2.bitShift(lowerPriceBoundary, -160));
  const sqrtPriceBx80 = Math2.sqrt(Math2.bitShift(upperPriceBoundary, -160));

  const lowerTickIndex = Tick.computeTickFromSqrtPrice(sqrtPriceAx80, 10);
  const upperTickIndex = Tick.computeTickFromSqrtPrice(sqrtPriceBx80, 10);

  const maximumTokensContributed = {
    x: new BigNumber(2 * config.tokenX.decimals),
    y: new BigNumber(2 * config.tokenY.decimals),
  };

  const liquidity = Liquidity.computeLiquidityFromAmount(
    maximumTokensContributed,
    sqrtPriceCx80,
    Tick.computeSqrtPriceFromTick(lowerTickIndex),
    Tick.computeSqrtPriceFromTick(upperTickIndex)
  );

  const setPositionOptions: SetPositionOptions = {
    lowerTickIndex,
    upperTickIndex,
    lowerTickWitness: -1048575,
    upperTickWitness: -1048575,
    liquidity,
    maximumTokensContributed,
    deadline: Math.floor(new Date().getTime() / 1000) + 9000,
  };

  const setPositionTransferParams = Position.setPositionOp(pool, setPositionOptions);

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

test("position - increases liquidity in existing position", async () => {
  const pool = await tezos.contract.at(config.pool);

  const storage = await pool.storage<PoolStorage>();

  // Fetch position 12 and increase liquidity by 10%
  const position = await storage.positions.get(12);
  const currentLiquidity = position.liquidity;
  const extraLiquidity = currentLiquidity.multipliedBy(0.1);

  const sqrtPriceCx80 = storage.sqrt_price;
  const sqrtPriceAx80 = Tick.computeSqrtPriceFromTick(position.lower_tick_index);
  const sqrtPriceBx80 = Tick.computeSqrtPriceFromTick(position.upper_tick_index);

  const amounts = Liquidity.computeAmountFromLiquidity(extraLiquidity, sqrtPriceCx80, sqrtPriceAx80, sqrtPriceBx80);

  const updatePositionOptions: UpdatePositionOptions = {
    positionId: 12,
    liquidityDelta: extraLiquidity,
    toX: await tezos.wallet.pkh(),
    toY: await tezos.wallet.pkh(),
    deadline: Math.floor(new Date().getTime() / 1000) + 9000,
    maximumTokensContributed: amounts,
  };

  const updatePositonTransferParams = Position.updatePositionOp(pool, updatePositionOptions);

  const op = await tezos.contract.transfer(updatePositonTransferParams);
  await op.confirmation();

  expect("applied").toEqual("applied");
});

test("position - removes liquidity from existing position", async () => {
  const pool = await tezos.contract.at(config.pool);

  const storage = await pool.storage<PoolStorage>();

  // Fetch position 12 and remove 10% of liquidity
  const position = await storage.positions.get(12);
  const currentLiquidity = position.liquidity;
  const liquidityToRemove = currentLiquidity.multipliedBy(-0.1);

  const updatePositionOptions: UpdatePositionOptions = {
    positionId: 12,
    liquidityDelta: liquidityToRemove,
    toX: await tezos.wallet.pkh(),
    toY: await tezos.wallet.pkh(),
    deadline: Math.floor(new Date().getTime() / 1000) + 9000,
    maximumTokensContributed: {
      x: new BigNumber(0),
      y: new BigNumber(0),
    },
  };

  const updatePositonTransferParams = Position.updatePositionOp(pool, updatePositionOptions);

  const op = await tezos.contract.transfer(updatePositonTransferParams);
  await op.confirmation();

  expect("applied").toEqual("applied");
});
