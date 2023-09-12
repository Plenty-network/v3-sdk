import { Token } from "../types";

export abstract class Helpers {
  static isCorrectOrderToken(tokenX: Token, tokenY: Token): boolean {
    const yIsFa12 = !tokenY.tokenId && tokenX.tokenId;
    const yAddressIsSmaller = tokenY.address < tokenX.address;
    const yTokenIdIsSmaller = tokenX.address === tokenY.address && (tokenY.tokenId ?? 0) < (tokenX.tokenId ?? 0);

    if (yIsFa12 || yAddressIsSmaller || yTokenIdIsSmaller) {
      return false;
    }
    return true;
  }
}
