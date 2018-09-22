import {Token} from "./token";

export class At extends Token {
  public static railroad(): string {
    return "@";
  }
}

export class WAt extends Token {
  public static railroad(): string {
    return " @";
  }
}

export class AtW extends Token {
  public static railroad(): string {
    return "@ ";
  }
}

export class WAtW extends Token {
  public static railroad(): string {
    return " @ ";
  }
}