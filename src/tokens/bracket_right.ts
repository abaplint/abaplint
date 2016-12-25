import {Token} from "./token";

export class BracketRight extends Token {
  public static railroad(): string {
    return "]";
  }
}

export class WBracketRight extends Token {
  public static railroad(): string {
    return " ]";
  }
}

export class BracketRightW extends Token {
  public static railroad(): string {
    return "] ";
  }
}

export class WBracketRightW extends Token {
  public static railroad(): string {
    return " ] ";
  }
}