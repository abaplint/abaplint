import {Issue} from "../issue";
import {Total} from "./total";

export class Code {
  public static output(issues: Array<Issue>): string {

    let result = "";
    for (let issue of issues) {
      let code = issue.getFile().getRawRows()[issue.getStart().getRow() - 1];
      if (code) {
        code = code.trim();
      }

      let text = issue.getFile().getFilename() +
                 "[" + issue.getStart().getRow() + ", " +
                 issue.getStart().getCol() + "] - " +
                 issue.getDescription() + " - " +
                 code + "\n";

      result = result + text;
    }

    return result + Total.output(issues);
  }
}