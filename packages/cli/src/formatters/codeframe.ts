import {Issue} from "@abaplint/core";
import {Total} from "./total";
import {IFormatter} from "./_iformatter";
import * as fs from "fs";
import chalk from "chalk";

type IssueDetails = {
  filename: string,
  location: string,
  description: string;
  severity: string;
  issueKey: string;
  row: number;
  col: number;
};

function issueSort(a: IssueDetails, b: IssueDetails): number {
  return a.filename.localeCompare(b.filename)
    || ( a.row - b.row )
    || ( a.col - b.col );
}

export class CodeFrame implements IFormatter {

  private currentFilename = "";
  private currentFileLinesCount = 0;
  private fileContent: string[] = [];

  public output(issues: Issue[], fileCount: number): string {
    const builtIssues = this.convertAllIssues(issues).sort(issueSort); // Make sure it is sorted by filename for caching to work
    return [
      ...builtIssues.map(i => this.renderIssue(i)),
      (issues.length > 0 ? chalk.red(new Total().output(issues, fileCount)) : chalk.green(new Total().output(issues, fileCount))),
    ].join("\n");
  }

  private convertAllIssues(issues: Issue[]): IssueDetails[] {
    return issues.map(i => this.convertIssue(i));
  }

  private cacheFile(filename: string): void {
    if (filename !== this.currentFilename) {
      this.currentFilename = filename;
      this.fileContent = fs.readFileSync(filename, "utf8").split(/\r?\n/);
      this.currentFileLinesCount = this.fileContent.length;
    }
  }

  private renderIssue(issue: IssueDetails): string {
    this.cacheFile(issue.filename);

    const frameSize = 1;
    const lineFrom = Math.max(issue.row - frameSize, 1);
    const lineTo = Math.min(issue.row + frameSize, this.currentFileLinesCount);
    const issueLineIndex = issue.row - 1;
    const padSize = Math.ceil(Math.log10(lineTo)) + 4;

    const code: string[] = [];
    for (let lineIndex = lineFrom - 1; lineIndex < lineTo; lineIndex++) {
      const prefix = `${ /*(lineIndex === issueLineIndex) ? ">" :*/ " " }${lineIndex + 1} |`.padStart(padSize);
      code.push(prefix + this.fileContent[lineIndex]);
      if (lineIndex === issueLineIndex) {
        code.push("|".padStart(padSize) + " ".repeat(issue.col - 1) + "^");
      }
    }

    const severityStr = issue.severity === "E"
      ? chalk.red(issue.severity)
      : chalk.yellow(issue.severity);

    return `[${severityStr}] ${issue.description} (${issue.issueKey}) @ ${issue.location}`
      + "\n"
      + code.map(str => chalk.grey(str)).join("\n")
      + "\n";
  }

  private renderLocation(issue: Issue): string {
    return issue.getFilename() + "[" + issue.getStart().getRow() + ", " + issue.getStart().getCol() + "]";
  }

  private convertIssue(issue: Issue): IssueDetails {
    return {
      location:    this.renderLocation(issue),
      description: issue.getMessage(),
      issueKey:    issue.getKey(),
      filename:    issue.getFilename(),
      severity:    issue.getSeverity().toString().charAt(0), //E/W/I
      row:         issue.getStart().getRow(),
      col:         issue.getStart().getCol(),
    };
  }

}