import {Issue} from "../issue";
import * as Formatters from ".";

export class Formatter {
  public static format(issues: Issue[], format: string, fileCount: number): string {
  // todo, this can be done more generic, move to artifacts.ts?
    switch (format) {
      case "total":
        return new Formatters.Total().output(issues, fileCount);
      case "json":
        return new Formatters.Json().output(issues, fileCount);
      case "junit":
        return new Formatters.Junit().output(issues, fileCount);
      default:
        return new Formatters.Standard().output(issues, fileCount);
    }
  }
}