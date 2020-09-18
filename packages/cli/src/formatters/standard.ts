import {Issue, Position} from "@abaplint/core";
import {Total} from "./total";
import {IFormatter} from "./_iformatter";

type IssueDetails = {
  filename: string,
  description: string;
  startPos: Position;
  rawFilename: string;
  severity: string;
};

export class Standard implements IFormatter {

  public output(issues: Issue[], fileCount: number): string {
    const tuples: IssueDetails[] = [];
    for (const issue of issues) {
      tuples.push(this.build(issue));
    }

    tuples.sort((a, b) => {
      const nameCompare = a.rawFilename.localeCompare(b.rawFilename);
      if (nameCompare === 0) {
        const rowCompare = a.startPos.getRow() - b.startPos.getRow();
        if (rowCompare === 0) {
          return a.startPos.getCol() - b.startPos.getCol();
        } else {
          return rowCompare;
        }
      } else {
        return nameCompare;
      }
    });

    const result = this.columns(tuples);

    return result + new Total().output(issues, fileCount);
  }

  private columns(issues: IssueDetails[]): string {
    let max = 0;
    issues.forEach((tuple) => {if (max < tuple.filename.length) {max = tuple.filename.length;} });

    let result = "";
    issues.forEach((issue) => {
      result = result +
        this.pad(issue.filename, max - issue.filename.length) +
        issue.description +
        ` [${issue.severity.charAt(0)}]\n`; //E/W/I
    });

    return result;
  }

  private pad(input: string, length: number): string {
    let output = input;
    for (let i = 0; i < length; i++) {
      output = output + " ";
    }
    return output + " - ";
  }

  private build(issue: Issue): IssueDetails {
    return {
      filename: issue.getFilename() + "[" + issue.getStart().getRow() + ", " + issue.getStart().getCol() + "]",
      description: issue.getMessage() + " (" + issue.getKey() + ")",
      startPos: issue.getStart(),
      rawFilename: issue.getFilename(),
      severity: issue.getSeverity().toString(),
    };
  }

}