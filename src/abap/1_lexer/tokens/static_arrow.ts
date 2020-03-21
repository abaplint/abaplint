import {Token} from "./_token";

export class StaticArrow extends Token {
  public static railroad(): string {
    return "=>";
  }
}

export class WStaticArrow extends Token {
  public static railroad(): string {
    return " =>";
  }
}

export class StaticArrowW extends Token {
  public static railroad(): string {
    return "=> ";
  }
}

export class WStaticArrowW extends Token {
  public static railroad(): string {
    return " => ";
  }
}