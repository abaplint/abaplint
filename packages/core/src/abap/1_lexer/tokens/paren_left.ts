import {AbstractToken} from "./abstract_token";

export class ParenLeft extends AbstractToken {
  public static railroad(): string {
    return "(";
  }
}

export class WParenLeft extends AbstractToken {
  public static railroad(): string {
    return " (";
  }
}

export class ParenLeftW extends AbstractToken {
  public static railroad(): string {
    return "( ";
  }
}

export class WParenLeftW extends AbstractToken {
  public static railroad(): string {
    return " ( ";
  }
}