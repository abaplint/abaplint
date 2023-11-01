import {AbstractToken} from "./abstract_token";

export class Plus extends AbstractToken {
  public static railroad(): string {
    return "+";
  }
}

export class WPlus extends AbstractToken {
  public static railroad(): string {
    return " +";
  }
}

export class PlusW extends AbstractToken {
  public static railroad(): string {
    return "+ ";
  }
}

export class WPlusW extends AbstractToken {
  public static railroad(): string {
    return " + ";
  }
}