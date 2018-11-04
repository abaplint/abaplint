import {Issue} from "../issue";
import * as Formatters from ".";

export class Formatter {
  public static format(issues: Array<Issue>, format?: string): string {
  // todo, this can be done more generic
    switch (format) {
      case "total":
        return new Formatters.Total().output(issues);
      case "json":
        return new Formatters.Json().output(issues);
      case "code":
        return new Formatters.Code().output(issues);
      default:
        return new Formatters.Standard().output(issues);
    }
  }
}