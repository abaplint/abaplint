import {Token} from "./token";

export class Plus extends Token {
  public static railroad(): string {
    return "+";
  }
}

export class WPlus extends Token {
  public static railroad(): string {
    return " +";
  }
}

export class PlusW extends Token {
  public static railroad(): string {
    return "+ ";
  }
}

export class WPlusW extends Token {
  public static railroad(): string {
    return " + ";
  }
}