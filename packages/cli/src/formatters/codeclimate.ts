import {Issue} from "@abaplint/core";
import {IFormatter} from "./_iformatter";
import {createHash} from "node:crypto";

function md5(content: string) {
  return createHash("md5").update(content).digest("hex");
}

export class CodeClimate implements IFormatter {

  public output(issues: Issue[], _fileCount: number): string {
    const out = [];
    const defaultSeverity = "info";
    const severityArray = ["info", "minor", "major", "critical", "blocker"];

    for (const issue of issues) {
      const single = {
        type: "issue",
        check_name: issue.getKey(),
        description: issue.getMessage(),
        categories: ["Code Quality"],
        location: {
          path: issue.getFilename(),
          lines: {
            begin: issue.getStart().getRow(),
            end: issue.getEnd().getRow(),
          },
        },
        severity: ( severityArray.includes(issue.getSeverity().toLowerCase()) ) ? issue.getSeverity().toLowerCase() : defaultSeverity,
        fingerprint: md5(issue.getKey() + issue.getMessage() + issue.getFilename() + issue.getStart().getRow() + issue.getEnd().getRow()),
      };
      out.push(single);
    }
    return JSON.stringify(out) + "\n";
  }

}