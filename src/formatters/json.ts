import {Issue} from "../issue";
import {IFormatter} from "./_iformatter";

export class Json implements IFormatter {

  public output(issues: Array<Issue>): string {
    const out = [];

    for (const issue of issues) {
      const single = {
        description: issue.getMessage(),
        file: issue.getFile().getFilename(),
        start: {
          row: issue.getStart().getRow(),
          col: issue.getStart().getCol(),
        },
        end: {
          row: issue.getEnd().getRow(),
          col: issue.getEnd().getCol(),
        },
      };
      out.push(single);
    }
    return JSON.stringify(out) + "\n";
  }

}