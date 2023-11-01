import {AbstractToken} from "./abstract_token";

export class StaticArrow extends AbstractToken {
  public static railroad(): string {
    return "=>";
  }
}

export class WStaticArrow extends AbstractToken {
  public static railroad(): string {
    return " =>";
  }
}

export class StaticArrowW extends AbstractToken {
  public static railroad(): string {
    return "=> ";
  }
}

export class WStaticArrowW extends AbstractToken {
  public static railroad(): string {
    return " => ";
  }
}