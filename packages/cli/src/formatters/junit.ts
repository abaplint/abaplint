import {Issue} from "@abaplint/core";
import {IFormatter} from "./_iformatter";
import {js2xml} from "xml-js";
import * as fs from "fs";

export class Junit implements IFormatter {

  private currentFilename = "";
  private currentFileLinesCount = 0;
  private fileContent: string[] = [];

  public output(issues: Issue[], _fileCount: number): string {
    const outputObj = {
      _declaration: {
        _attributes: {
          version: "1.0",
          encoding: "UTF-8",
        },
      },
      testsuites: {
        testsuite: {
          _attributes: {
            name: "abaplint",
            tests: issues.length || 1,
            failures: issues.length,
            errors: 0,
            skipped: 0,
          },
          testcase: [] as any,
        },
      },
    };

    if (issues.length > 0) {
      for (const issue of issues) {
        outputObj.testsuites.testsuite.testcase.push({
          _attributes: {
            classname: issue.getFilename().split(".")[0],
            file: issue.getFilename(),
            name: `${issue.getFilename()}: [${issue.getStart().getRow()}, ${issue.getStart().getCol()}] - ${issue.getKey()}`,
          },
          failure: {
            _attributes: {
              message: this.formatFailureMessage(issue.getMessage()),
              type: issue.getSeverity().toString(),
            },
            _cdata: `${this.renderIssue(issue)}`,
          },
        });
      }
    } else {
      outputObj.testsuites.testsuite.testcase.push({
        _attributes: {
          classname: "none",
          name: "OK",
        },
      });
    }

    const xml = js2xml(outputObj, {compact: true, spaces: 2});

    return xml;
  }

  private cacheFile(filename: string): void {
    if (filename !== this.currentFilename) {
      this.currentFilename = filename;
      this.fileContent = fs.readFileSync(filename, "utf8").split(/\r?\n/);
      this.currentFileLinesCount = this.fileContent.length;
    }
  }

  private renderIssue(issue: Issue): string {
    this.cacheFile(issue.getFilename());

    const frameSize = 1;
    const lineFrom = Math.max(issue.getStart().getRow() - frameSize, 1);
    const lineTo = Math.min(issue.getStart().getRow() + frameSize, this.currentFileLinesCount);
    const issueLineIndex = issue.getStart().getRow() - 1;
    const padSize = Math.ceil(Math.log10(lineTo)) + 4;

    const code: string[] = [];
    for (let lineIndex = lineFrom - 1; lineIndex < lineTo; lineIndex++) {
      const prefix = `${lineIndex + 1} | `.padStart(padSize, "0");
      code.push(prefix + this.fileContent[lineIndex]);
      if (lineIndex === issueLineIndex) {
        code.push("| ".padStart(padSize) + " ".repeat(issue.getStart().getCol() - 1) + "^");
      }
    }

    return code.map(str => str).join("\n");
  }

  private formatFailureMessage(message: string): string {
    let ret = message;
    while (ret.includes("<")) {
      ret = ret.replace("<", "&lt;");
    }
    while (ret.includes(">")) {
      ret = ret.replace(">", "&gt;");
    }
    return ret;
  }

}
