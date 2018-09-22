import {Token} from "./token";

export class ParenRight extends Token {
  public static railroad(): string {
    return ")";
  }
}

export class WParenRight extends Token {
  public static railroad(): string {
    return " )";
  }
}

export class ParenRightW extends Token {
  public static railroad(): string {
    return ") ";
  }
}

export class WParenRightW extends Token {
  public static railroad(): string {
    return " ) ";
  }
}