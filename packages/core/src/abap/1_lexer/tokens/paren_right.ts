import {AbstractToken} from "./abstract_token";

export class ParenRight extends AbstractToken {
  public static railroad(): string {
    return ")";
  }
}

export class WParenRight extends AbstractToken {
  public static railroad(): string {
    return " )";
  }
}

export class ParenRightW extends AbstractToken {
  public static railroad(): string {
    return ") ";
  }
}

export class WParenRightW extends AbstractToken {
  public static railroad(): string {
    return " ) ";
  }
}