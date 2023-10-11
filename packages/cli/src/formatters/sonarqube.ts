import {Issue} from "@abaplint/core";
import {IFormatter} from "./_iformatter";

export class Sonarqube implements IFormatter {

  public output(issues: Issue[], _fileCount: number): string {

    const out: any = {};
    const issueArray = [];
    const defaultSeverity = "INFO";
    const severityArray = ["INFO", "MINOR", "MAJOR", "CRITICAL", "BLOCKER"];
    type sonarIssue = {
      engineId: string;
      ruleId: any;
      severity: any;
      type: string;
      primaryLocation: {
        message: any;
        filePath: any;
        textRange: {
          startLine: any;
          endLine: any;
          startColumn?: number;
          endColumn?: number;
        };
      };
      effortMinutes: number;
    };

    for (const issue of issues) {
      const startOffset = issue.getStart().getCol() - 1;
      const endOffset = issue.getEnd().getCol() - 2;
      const single: sonarIssue = {
        engineId: "abaplint",
        ruleId: issue.getKey(),
        severity: ( severityArray.includes(issue.getSeverity().toUpperCase()) ) ? issue.getSeverity().toUpperCase() : defaultSeverity,
        type:"CODE_SMELL",
        primaryLocation: {
          message: issue.getMessage(),
          filePath: issue.getFilename(),
          textRange: {
            startLine: issue.getStart().getRow(),
            endLine: issue.getEnd().getRow(),
            startColumn: startOffset,
            endColumn: endOffset,
          },
        },
        effortMinutes: 10,
      };
      if (startOffset >= endOffset )
      {
        delete single.primaryLocation.textRange.startColumn;
        delete single.primaryLocation.textRange.endColumn;
      }
      issueArray.push(single);
    }
    out.issues = issueArray;
    return JSON.stringify(out) + "\n";
  }
}
