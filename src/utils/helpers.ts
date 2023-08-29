import { Token } from "../types";

export abstract class Helpers {
  /**
   * Orders given tokens following the criteria specified in the factory during deployment of a pair.
   */
  static orderTokens(tokenX: Token, tokenY: Token): [Token, Token] {
    return tokenX.address === tokenY.address
      ? (tokenX.tokenId ?? 0) < (tokenY.tokenId ?? 0)
        ? [tokenX, tokenY]
        : [tokenY, tokenX]
      : tokenX.address < tokenY.address
      ? [tokenX, tokenY]
      : [tokenY, tokenX];
  }
}
