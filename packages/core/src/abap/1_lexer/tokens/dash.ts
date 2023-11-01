import {AbstractToken} from "./abstract_token";

export class Dash extends AbstractToken {
  public static railroad(): string {
    return "-";
  }
}

export class WDash extends AbstractToken {
  public static railroad(): string {
    return " -";
  }
}

export class DashW extends AbstractToken {
  public static railroad(): string {
    return "- ";
  }
}

export class WDashW extends AbstractToken {
  public static railroad(): string {
    return " - ";
  }
}