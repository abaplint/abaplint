import {Token} from "./_token";

export class ParenLeft extends Token {
  public static railroad(): string {
    return "(";
  }
}

export class WParenLeft extends Token {
  public static railroad(): string {
    return " (";
  }
}

export class ParenLeftW extends Token {
  public static railroad(): string {
    return "( ";
  }
}

export class WParenLeftW extends Token {
  public static railroad(): string {
    return " ( ";
  }
}