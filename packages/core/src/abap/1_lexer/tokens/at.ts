import {AbstractToken} from "./abstract_token";

export class At extends AbstractToken {
  public static railroad(): string {
    return "@";
  }
}

export class WAt extends AbstractToken {
  public static railroad(): string {
    return " @";
  }
}

export class AtW extends AbstractToken {
  public static railroad(): string {
    return "@ ";
  }
}

export class WAtW extends AbstractToken {
  public static railroad(): string {
    return " @ ";
  }
}