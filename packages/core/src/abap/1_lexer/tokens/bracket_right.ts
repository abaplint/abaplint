import {AbstractToken} from "./abstract_token";

export class BracketRight extends AbstractToken {
  public static railroad(): string {
    return "]";
  }
}

export class WBracketRight extends AbstractToken {
  public static railroad(): string {
    return " ]";
  }
}

export class BracketRightW extends AbstractToken {
  public static railroad(): string {
    return "] ";
  }
}

export class WBracketRightW extends AbstractToken {
  public static railroad(): string {
    return " ] ";
  }
}