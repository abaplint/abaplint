import {AbstractToken} from "./abstract_token";

export class BracketLeft extends AbstractToken {
  public static railroad(): string {
    return "[";
  }
}

export class WBracketLeft extends AbstractToken {
  public static railroad(): string {
    return " [";
  }
}

export class BracketLeftW extends AbstractToken {
  public static railroad(): string {
    return "[ ";
  }
}

export class WBracketLeftW extends AbstractToken {
  public static railroad(): string {
    return " [ ";
  }
}