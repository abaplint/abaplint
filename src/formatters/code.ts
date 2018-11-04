import {Issue} from "../issue";
import {Total} from "./total";
import {IFormatter} from "./_iformatter";

// for CodeClimate output?

export class Code implements IFormatter {
  public output(issues: Array<Issue>): string {

    let result = "";
    for (let issue of issues) {
      let code = issue.getFile().getRawRows()[issue.getStart().getRow() - 1];
      if (code) {
        code = code.trim();
      }

      let text = issue.getFile().getFilename() +
                 "[" + issue.getStart().getRow() + ", " +
                 issue.getStart().getCol() + "] - " +
                 issue.getMessage() + " - " +
                 code + "\n";

      result = result + text;
    }

    return result + new Total().output(issues);
  }
}