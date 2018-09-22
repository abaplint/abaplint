import {Token} from "./token";

export class BracketLeft extends Token {
  public static railroad(): string {
    return "[";
  }
}

export class WBracketLeft extends Token {
  public static railroad(): string {
    return " [";
  }
}

export class BracketLeftW extends Token {
  public static railroad(): string {
    return "[ ";
  }
}

export class WBracketLeftW extends Token {
  public static railroad(): string {
    return " [ ";
  }
}