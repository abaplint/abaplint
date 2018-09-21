import {Issue} from "../issue";
import * as Formatters from "./";

export class Formatter {
  public static format(issues: Array<Issue>, format?: string): string {
  // todo, this can be done more generic
    switch (format) {
      case "total":
        return Formatters.Total.output(issues);
      case "json":
        return Formatters.Json.output(issues);
      case "code":
        return Formatters.Code.output(issues);
      default:
        return Formatters.Standard.output(issues);
    }
  }
}