import {Token} from "./token";

export class Dash extends Token {
  public static railroad(): string {
    return "-";
  }
}

export class WDash extends Token {
  public static railroad(): string {
    return " -";
  }
}

export class DashW extends Token {
  public static railroad(): string {
    return "- ";
  }
}

export class WDashW extends Token {
  public static railroad(): string {
    return " - ";
  }
}