import { Token } from "../types";

export abstract class Helpers {
  static isCorrectOrderToken(tokenX: Token, tokenY: Token): boolean {
    if (tokenX.address === tokenY.address && tokenX.tokenId === tokenY.tokenId) {
      throw "SAME_TOKENS_NOT_ALLOWED";
    }

    const isTokenXFA2 = tokenX.tokenId !== undefined;
    const isTokenYFa2 = tokenY.tokenId !== undefined;

    const yAddressIsSmaller = tokenY.address < tokenX.address;
    const yTokenIdIsSmaller = tokenX.address === tokenY.address && (tokenY.tokenId ?? 0) < (tokenX.tokenId ?? 0);

    if ((isTokenXFA2 && !isTokenYFa2) || (isTokenXFA2 === isTokenYFa2 && yAddressIsSmaller) || yTokenIdIsSmaller) {
      return false;
    }
    return true;
  }
}
