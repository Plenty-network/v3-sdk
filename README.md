# Plentyswap V3 SDK

This repository contains our beta V3 SDK for Typescript developers. It simplifies interaction with [Plenty's segmented CFMM](https://github.com/Plenty-network/plentyswap-v3) by offering essential math utilities and operation object creation for tasks like swapping, liquidity management, and staking positions in farms.

The SDK is extensively utilized within our frontend application, hosted at [app.plenty.nework](https://app.plenty.network). Furthermore, it plays a pivotal role in the testing processes within our [smart contract repository](https://github.com/Plenty-network/plentyswap-v3).

> 👷 As this is beta software, both the code and documentation will undergo continuous improvement over time. If you have any questions about how to use the SDK or wish to report bugs, please feel free to reach out to us at our [discord server](https://discord.com/invite/plentynetwork).

## 🛠️ Installation

You can install the SDK through npm:

```
npm install @plenty-labs/v3-sdk
```

The SDK makes extensive use of the [Taquito](https://tezostaquito.io/) library for utilities that allow for interaction with smart contracts.

[Make reference to Plenty API to fetch contract addresses]

## 📝 Guide

Here are reference scenarios to guide you in using the SDK to interact with the contracts. For an in-depth understanding of the math, you may check the README provided [here](<[https://github.com/Plenty-network/v3-sdk/tree/master/src/utils](https://github.com/Plenty-network/plentyswap-v3/blob/master/SPECIFICATION.md)>).

- [Estimations](#⚖️-Estimations)
  - [Essential setup](#essential-setup)
  - [Swap output](#estimating-swap-output)
  - [Liquidity](#estimating-liquidity)
  - [Fees collected by a position](#estimating-fees-collected-by-a-position)
  - [Staking rewards](#estimating-unclaimed-staking-reward)
- [Operations](#💰-operations)
  - [Performing a swap](#performing-a-swap-operation)
  - [Managing a position](#managing-a-position)
  - [Staking a position](#staking-a-position)
- [Math Reference](#🧮-math-reference)

## ⚖️ Estimations

With the SDK, you can effortlessly estimate a wide range of values by inputting the state from the smart contract storage. To access the smart contract storage you can either use Taquito or a tool like [tzkt API](https://api.tzkt.io/#operation/Contracts_GetStorage). For the purpose of this demonstration, we'll use Taquito.

### Essential Setup

```typescript
import { TezosToolkit } from "@taquito/taquito";

const tezos = new TezosToolkit("https://ghostnet.smartpy.io"); // Select rpc node of your choice

(async () => {
  // Create Taquito contract instance of the CFMM
  const cfmm = await tezos.contract.at(process.env.CFMM_ADDRESS as string);

  // Pull the smart contract storage
  const storage = await cfmm.storage();

  // Rest of the code
  // ......
})();
```

---

### Estimating swap output

To estimate the output received in token-y when swapping in token-x or vice versa, you can use the [Pool entity](https://github.com/Plenty-network/v3-sdk/blob/master/src/entities/pool.ts#L25):

```typescript
import BigNumber from "bignumber.js";
import { Pool } from "@plenty-labs/v3-sdk";

(async () => {
  // .....
  // Essential setup

  // Create an instance of the Pool class
  const pool = new Pool(
    storage.cur_tick_index.toNumber(),
    storage.cur_tick_witness.toNumber(),
    storage.constants.tick_spacing.toNumber(),
    storage.sqrt_price,
    storage.fee_bps.toNumber(),
    storage.liquidity
  );

  // Input amount token x
  const tokenXIn = new BigNumber(10);

  // Estimate the final output amount of token y
  const estimatedOutputY = await pool.estimateSwapXToY(tokenXIn, async (tick: number) => {
    const tickElement = await storage.ticks.get(tick);
    return {
      index: tick,
      prevIndex: tickElement.prev.toNumber(),
      nextIndex: tickElement.next.toNumber(),
      liquidityNet: tickElement.liquidity_net,
      sqrtPrice: tickElement.sqrt_price,
    };
  });
})();
```

The same can achieved for estimate token y to token x swaps through `pool.estimateSwapYToX(...)`.

Both `estimateSwapYToX` and `estimateSwapXToY` accept a custom function of type `(index: number) => Promise<TickElement>` as the second argument. It is upon you to device a way of supplying the tick states to the estimation function. You can either use Taquito (as shown above), [tzkt API](https://api.tzkt.io/#operation/BigMaps_GetKeys) or [Plenty's unified API]()

---

### Estimating liquidity

Similar to estimating swaps, you can use the [Pool entity](https://github.com/Plenty-network/v3-sdk/blob/master/src/entities/pool.ts#L25) to estimate the amount of token y required when a certain amount of token x is being added as liquidity in a price range.

> ⚠️ It is crucial to have an understanding of how price ranges and ticks work in a segmented cfmm when using the liquidity estimation utility. The function call may throw an error if called incorrectly.

```typescript
import BigNumber from "bignumber.js";
import { Pool, Price, Tick, Token } from "@plenty-labs/v3-sdk";

(async () => {
  // .....
  // Essential setup

  // Create an instance of the Pool class
  const pool = new Pool(
    storage.cur_tick_index.toNumber(),
    storage.cur_tick_witness.toNumber(),
    storage.constants.tick_spacing.toNumber(),
    storage.sqrt_price,
    storage.fee_bps.toNumber(),
    storage.liquidity
  );

  // Create objects for the tokens in the pair
  const tokenX: Token = { address: "KT1Uw1oio434UoWFuZTNKFgt5wTM9tfuf7m7", tokenId: 2, decimals: 6 };
  const tokenY: Token = { address: "KT1Uw1oio434UoWFuZTNKFgt5wTM9tfuf7m7", tokenId: 5, decimals: 18 };

  // Price boundaries Y / X
  const lowerPriceBoundary = new BigNumber(0.99);
  const upperPriceBoundary = new BigNumber(1.01);

  // Calculate lower and upper tick indices using the math utilities
  const lowerTickIndex = Tick.computeTickFromSqrtPrice(
    Price.computeSqrtPriceFromRealPrice(lowerPriceBoundary, tokenX, tokenY),
    storage.constants.tick_spacing.toNumber()
  );
  const upperTickIndex = Tick.computeTickFromSqrtPrice(
    Price.computeSqrtPriceFromRealPrice(upperPriceBoundary, tokenX, tokenY),
    storage.constants.tick_spacing.toNumber()
  );

  // Amount of token x
  const tokenXAmount = new BigNumber(10);

  // Estimate the amount of token y required when the above specified amount of token x
  // is added as liquidity in the price range 0.99 -> 1.01
  const tokenYAmount = await pool.estimateAmountYFromX(tokenXAmount, lowerTickIndex, upperTickIndex);
})();
```

The same can be done to estimate amount of token x required for a certain amount of token y through `pool.estimateAmountXFromY(...)`.

---

### Estimating fees collected by a position

To estimate current unclaimed fees accrued by a position, you can use the [Position entity](https://github.com/Plenty-network/v3-sdk/blob/master/src/entities/position.ts).

```typescript
import BigNumber from "bignumber.js";
import { Pool, Position } from "@plenty-labs/v3-sdk";

(async () => {
  // .....
  // Essential setup

  // Retrieve the position from the storage
  const pos = await storage.positions.get(<position-id>);

  // Create an instance of the Pool class for the cfmm to which the position belongs
  const pool = new Pool(
    storage.cur_tick_index.toNumber(),
    storage.cur_tick_witness.toNumber(),
    storage.constants.tick_spacing.toNumber(),
    storage.sqrt_price,
    storage.fee_bps.toNumber(),
    storage.liquidity
  );

  // Create an instance of the Position class
  const position = new Position(
    pool,
    pos.lower_tick_index.toNumber(),
    pos.upper_tick_index.toNumber(),
    pos.liquidity,
    pos.fee_growth_inside_last
  );

  // Pull the latest tick states of the positions lower and upper tick
  const lowerTickState = await storage.ticks.get(pos.lower_tick_index.toNumber());
  const upperTickState = await storage.ticks.get(pos.lower_tick_index.toNumber());

  // Compute the fees
  const feesCollected = position.computeFees(
    storage.fee_growth,
    lowerTickState.fee_growth_outside,
    upperTickState.fee_growth_outside
  );
})();
```

Similarly, you can use `position.computeTokenAmounts()` to estimate the amount of each token present within the position. This utility does not require any other state to be passed into it.

---

### Estimating unclaimed staking reward

You can use the [Stake entity](https://github.com/Plenty-network/v3-sdk/blob/master/src/entities/stake.ts) to estimate unclaimed rewards for a position that is staked in [Plenty's v3 farm contract](https://github.com/Plenty-network/plentyswap-v3/blob/master/src/ligo/farm.mligo).

```typescript
import { Stake, Incentive } from "@plenty-labs/v3-sdk";

(async () => {
  // .....
  // Essential setup without retrieving pool storage

  // Create a Taquito instance of the farm contract
  const farm = await tezos.contract.at(process.env.FARM_CONTRACT as string);

  const storage = await farm.storage();

  // Pull the incentive and stake state
  const incentiveState = await storage.incentives.get(<incentive-id>);
  const stakeState = await storage.stakes.get({ 0: <position-id>; 1: <incentive-id> });

  const incentive: Incentive = {
    startTime: Math.floor(new Date(incentiveState.start_time).getTime() / 1000),
    endTime: Math.floor(new Date(incentiveState.end_time).getTime() / 1000),
    totalRewardUnclaimed: incentiveState.total_reward_unclaimed,
    totalSecondsClaimed: incentiveState.total_seconds_claimed,
  }

  // Create an instance of the Stake class
  const stake = new Stake(incentive, stakeState.liquidity, stakeState.seconds_per_liquidity_inside_last);

  // Compute the latest value of `seconds_per_liquidity_inside` between the lower and upper ticks of stake position
  // Run the `snapshot_cumulatives_inside` onchain view of the cfmm to do that easily
  const { seconds_per_liquidity_inside } = await cfmm.contractViews.snapshot_cumulatives_inside(
    { lower_tick_index: <lower-tick-index-of-position>, upper_tick_index: <upper-tick-index-of-position> }
  ).executeView({ viewCaller: <any-tz-address> });

  // Compute unclaimed rewards
  const unclaimedRewards = stake.computeUnclaimedReward(seconds_per_liquidity_inside);
})();
```

## 💰 Operations

Using the SDK, you can construct Taquito's TransferParams for v3 contract calls and send them very flexibly in an operation, either as a standalone or within a [batch](https://tezostaquito.io/docs/batch_API).

> ⚠️ Please follow through the [essential setup](#essential-setup) before proceeding.

### Performing a swap operation

You can perform a swap in a pool from token x to token y or vice versa using the [Swap Portal](https://github.com/Plenty-network/v3-sdk/blob/master/src/swapPortal.ts#L52).

```typescript
import { OpKind, ParamsWithKind } from "@taquito/taquito";
import { SwapPortal } from "@plenty-labs/v3-sdk";

(async () => {
  // .....
  // Essential setup

  // Create Taquito contract instance for token x
  const tokenX = await tezos.contract.at(process.env.TOKEN_X as string);

  // Amount of token x being swapped for token y
  const tokenXIn = new BigNumber(10);

  // Minimum amount of token y expected to be received
  const minTokenYOut = new BigNumber(0);

  // Transaction deadline (optional value)
  // const deadline =

  // Output recipient
  const recipient = <tz-KT-address>;

  // Create a batch params
  const batchParams: ParamsWithKind[] = [
    // Allow cfmm contract to spend token x (For this demonstration, token x is fa2)
    {
      kind: OpKind.TRANSACTION,
      ...Approvals.updateOperatorsFA2(tokenX, [
          { add_operator: { owner: <tz-address>, operator: cfmm.address, token_id: <token-id> } },
      ]),
    },
    {
      kind: OpKind.TRANSACTION,
      ...SwapPortal.swapXToY(
        cfmm,
        { tokenXIn, minTokenYOut, recipient }
      ),
    }
  ];

  // Send the batch
  await tezos.contract.batch(batchParams).send();
})();
```

- Similarly, `SwapPortal.swapYToX(...)` can be used to swap from token y to token x.
- You can use the [Approvals utility](https://github.com/Plenty-network/v3-sdk/blob/master/src/utils/approvals.ts) for approving token spendings for both FA1.2 and FA2 tokens.
- By using the swap output estimation utility as explained in [this section](#estimating-swap-output), you can estimate the maximum amount of output that you may receive. You can set this as the value of `minTokenYOut` or `minTokenXOut` for a zero slippage trade.
- `deadline` is an optional field. It defaults to 15 minutes from now. If the trade is not completed within the deadline, it does not go through.

---

### Managing a position

You can create a new position and increase or decrease the liquidity in an existing one through the [Position Manager](https://github.com/Plenty-network/v3-sdk/blob/master/src/positionManager.ts#L99). In a segmented cfmm, liquidity is always added in a specific price range represented by tick values - lower tick and upper tick.

To create a new position, you must determine the quantity of each token in the pair being added as liquidity. You can achieve this by either fixing one token's amount and then following the instructions under [estimating liquidity](#estimating-liquidity) to calculate the required amount of the other token. Alternatively, for greater convenience, you can start with the maximum value of the individual tokens you intend to contribute and allow the SDK to calculate the required individual amounts.

```typescript
async () => {
  //....

  const sqrtPriceAx80 = Tick.computeSqrtPriceFromTick(lowerTickIndex); // Sqrt price at lower index
  const sqrtPriceBx80 = Tick.computeSqrtPriceFromTick(upperTickIndex); // Sqrt price at upper index
  const sqrtPriceCx80 = storage.sqrt_price;

  // Arbitrary initial amounts
  const amount = {
    x: number(50 * DECIMALS),
    y: number(50 * DECIMALS),
  };

  // SDK resolves the correct liquidity and associated amounts
  const liquidity = Liquidity.computeLiquidityFromAmount(amount, sqrtPriceCx80, sqrtPriceAx80, sqrtPriceBx80);
  const finalAmounts = Liquidity.computeAmountFromLiquidity(liquidity, sqrtPriceCx80, sqrtPriceAx80, sqrtPriceBx80);

  //....
};
```

Once you have the final amounts, you can prepare the options to be passed in `PositionManager.setPositionOp(...)`. As you can see below the options require a lower and upper tick witness. The tick witness is essentially the greatest tick less than the individual ticks. To retrieve the tick witness you may either run a binary search on the initialised ticks, or use the utility provided by [Plenty's unified API]().

```typescript
import { OpKind, ParamsWithKind } from "@taquito/taquito";
import { PositionManager, SetPositionOptions } from "@plenty-labs/v3-sdk";

(async () => {
  // .....
  // Essential setup and figuring out final amounts

  // Create Taquito contract instance for token x and y
  const tokenX = await tezos.contract.at(process.env.TOKEN_X as string);
  const tokenY = await tezos.contract.at(process.env.TOKEN_Y as string);

  const options: SetPositionOptions = {
      lowerTickIndex,
      upperTickIndex,
      lowerTickWitness: <lower-tick-witness>,
      upperTickWitness: <upper-tick-witness>,
      liquidity,
      maximumTokensContributed: finalAmounts,
      // deadline - optional date field that defaults to 15 minutes from current time
  };

  // Create a batch params
  const batchParams: ParamsWithKind[] = [
    // Allow cfmm contract to spend token x and y
    {
      kind: OpKind.TRANSACTION,
      ...Approvals.updateOperatorsFA2(tokenX, [
          { add_operator: { owner: <tz-address>, operator: cfmm.address, token_id: <token-id> } },
      ]),
    },
     {
      kind: OpKind.TRANSACTION,
      ...Approvals.updateOperatorsFA2(tokenY, [
          { add_operator: { owner: <tz-address>, operator: cfmm.address, token_id: <token-id> } },
      ]),
    },
    {
      kind: OpKind.TRANSACTION,
      ...PositionManager.setPositionOp(
        cfmm,
        options,
      ),
    },
  ];

  // Send the batch
  await tezos.contract.batch(batchParams).send();
})();
```

If you have an existing position, you can adjust the liquidity within it by using `PositionManager.updatePositionOp(...)`.

Within this utility, you will find a field named `liquidityDelta`. A positive liquidity delta indicates that liquidity is being added to the position, while a negative value implies removal. When adding liquidity, you can calculate the required value of `liquidityDelta` in the same manner as you calculate `liquidity`, as demonstrated in the initial code snippet under [Managing positions](#managing-positions). Conversely, when removing liquidity, you can consider `liquidityDelta` as a percentage of liquidity being withdrawn. For instance, if the current position's `liquidity` is `120`, and you intend to remove 10% of the liquidity, the `liquidityDelta` would be `-12`.

Another important field is `tokensLimit`. When increasing liquidity, this value represents the maximum number of tokens that can be added to the position. Conversely, when removing liquidity, it signifies the minimum number of tokens that must be received. Failure to meet the tokens limit will result in the transaction being reverted.

```typescript
import { OpKind, ParamsWithKind } from "@taquito/taquito";
import { PositionManager, UpdatePositionOptions } from "@plenty-labs/v3-sdk";

(async () => {
  // .....
  // Essential setup and calculating `liquidityDelta`

  const options: UpdatePositionOptions = {
      positionId: 1, //
      liquidityDelta, // Remember to make it negative for liquidity removal
      toX: <tz-KT-address>, // Only relevant for liquidity removal. This address is where the tokens are sent.
      toY: <tz-KT-address>, // Same as above.
      // deadline - optional date field
      tokensLimit: finalAmounts, // If you intend to remove liquidity, you can reverse-calculate this through `liquidityDelta`
  };

  // Create a batch params
  // Approvals are only required for liquidity addition
  const batchParams: ParamsWithKind[] = [
    // Allow cfmm contract to spend token x and y
    {
      kind: OpKind.TRANSACTION,
      ...Approvals.updateOperatorsFA2(tokenX, [
          { add_operator: { owner: <tz-address>, operator: cfmm.address, token_id: <token-id> } },
      ]),
    },
     {
      kind: OpKind.TRANSACTION,
      ...Approvals.updateOperatorsFA2(tokenY, [
          { add_operator: { owner: <tz-address>, operator: cfmm.address, token_id: <token-id> } },
      ]),
    },
    {
      kind: OpKind.TRANSACTION,
      ...PositionManager.updatePositonOp(
        cfmm,
        options,
      ),
    },
  ];

  // Send the batch
  await tezos.contract.batch(batchParams).send();
})();
```

There is another utility `PositionManager.collectFeesOp(...)` provided that internally utilises `updatePositionOp` and only retrieves fees collected by the position.

---

### Staking a position

You can stake your liquidity to farm rewards in a [Plenty v3 farm contract](https://github.com/Plenty-network/plentyswap-v3/blob/master/src/ligo/farm.mligo) via the [StakeManager](https://github.com/Plenty-network/v3-sdk/blob/master/src/stakeManager.ts).

```typescript
import { OpKind, ParamsWithKind } from "@taquito/taquito";
import { StakeManager, StakeOptions } from "@plenty-labs/v3-sdk";

(async () => {
  // .....
  // Essential setup

  // Initialise Taquito contract instance of the farm
  const farm = await tezos.contract.at(process.env.FARM_CONTRACT as string);

  const options: StakeOptions = {
      incentiveId: <incentive-id>,
      tokenId: <position-id>,
  };

  // Create a batch params
  // Approval is only required if it is the first stake
  const batchParams: ParamsWithKind[] = [
    // Allow farm contract to spend cfmm position token
    {
      kind: OpKind.TRANSACTION,
      ...Approvals.updateOperatorsFA2(cfmm, [
          { add_operator: { owner: <tz-address>, operator: farm.address, token_id: <token-id> } },
      ]),
    },
    {
      kind: OpKind.TRANSACTION,
      ...StakeManager.stake(
        farm,
        options,
      ),
    },
  ];

  // Send the batch
  await tezos.contract.batch(batchParams).send();
})();
```

## 🧮 Math reference

Most of the mathematics used in the segmented CFMM is comprehensively explained in this [Specification](https://github.com/Plenty-network/plentyswap-v3/blob/master/SPECIFICATION.md). The SDK exposes two abstract classes with TypeScript utilities that mirror the mathematical operations. These utilities are valuable in various instances if you are developing on top of Plenty v3.

- [Liquidity](https://github.com/Plenty-network/v3-sdk/blob/master/src/utils/liquidity.ts): This is most useful when managing positions. You can use it to calculate the `liquidity` via token amounts and vice versa.
- [Tick](https://github.com/Plenty-network/v3-sdk/blob/master/src/utils/tick.ts): This is primarily utilised in the conversion of tick <> square root price used in the cfmm. It is also often used in tandem with [Price](https://github.com/Plenty-network/v3-sdk/blob/master/src/utils/price.ts) utility to calculate tick directly from the human-readable price.
