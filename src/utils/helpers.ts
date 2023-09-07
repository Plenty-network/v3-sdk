import { Token } from "../types";

export abstract class Helpers {
  /**
   * Orders given tokens following the criteria specified in the factory during deployment of a pair.
   */
  static orderTokens(tokenX: Token, tokenY: Token): [Token, Token] {
    let [tx, ty] = [tokenX, tokenY];

    const yIsFa12 = !tokenY.tokenId && tokenX.tokenId;
    const yAddressIsSmaller = tokenY.address < tokenX.address;
    const yTokenIdIsSmaller = tokenX.address === tokenY.address && (tokenY.tokenId ?? 0) < (tokenX.tokenId ?? 0);

    if (yIsFa12 || yAddressIsSmaller || yTokenIdIsSmaller) {
      [tx, ty] = [tokenY, tokenX];
    }

    return [tx, ty];
  }
}
