import BigNumber from "bignumber.js";
import { TokenStandard } from "../types";
import { Tick } from "./tick";

console.log(
  Tick.computeTickFromRealPrice(
    new BigNumber(0.9),
    { address: "", decimals: 18, standard: TokenStandard.FA2 },
    { address: "", decimals: 6, standard: TokenStandard.FA2 },
    10
  )
);
