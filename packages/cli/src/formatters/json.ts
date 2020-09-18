import {Issue} from "@abaplint/core";
import {IFormatter} from "./_iformatter";

export class Json implements IFormatter {

  public output(issues: Issue[], _fileCount: number): string {
    const out = [];

    for (const issue of issues) {
      const single = {
        description: issue.getMessage(),
        key: issue.getKey(),
        file: issue.getFilename(),
        start: {
          row: issue.getStart().getRow(),
          col: issue.getStart().getCol(),
        },
        end: {
          row: issue.getEnd().getRow(),
          col: issue.getEnd().getCol(),
        },
        severity: issue.getSeverity(),
      };
      out.push(single);
    }
    return JSON.stringify(out) + "\n";
  }

}