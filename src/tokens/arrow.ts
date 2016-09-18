import {Token} from "./token";

export class Arrow extends Token {
  public static railroad(): string {
    return "->/=>";
  }
}

export class WArrow extends Token {
  public static railroad(): string {
    return " ->/=>";
  }
}

export class ArrowW extends Token {
  public static railroad(): string {
    return "->/=> ";
  }
}

export class WArrowW extends Token {
  public static railroad(): string {
    return " ->/=> ";
  }
}