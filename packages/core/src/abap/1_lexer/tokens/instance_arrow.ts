import {AbstractToken} from "./abstract_token";

export class InstanceArrow extends AbstractToken {
  public static railroad(): string {
    return "->";
  }
}

export class WInstanceArrow extends AbstractToken {
  public static railroad(): string {
    return " ->";
  }
}

export class InstanceArrowW extends AbstractToken {
  public static railroad(): string {
    return "-> ";
  }
}

export class WInstanceArrowW extends AbstractToken {
  public static railroad(): string {
    return " -> ";
  }
}