import {Token} from "./_token";

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