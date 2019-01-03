import {Token} from "./_token";

export class InstanceArrow extends Token {
  public static railroad(): string {
    return "->";
  }
}

export class WInstanceArrow extends Token {
  public static railroad(): string {
    return " ->";
  }
}

export class InstanceArrowW extends Token {
  public static railroad(): string {
    return "-> ";
  }
}

export class WInstanceArrowW extends Token {
  public static railroad(): string {
    return " -> ";
  }
}