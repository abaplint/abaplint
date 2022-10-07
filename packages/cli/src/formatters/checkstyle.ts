import {Issue} from "@abaplint/core";
import {IFormatter} from "./_iformatter";
import {js2xml} from "xml-js";

export class Checkstyle implements IFormatter {

  public output(issues: Issue[], _fileCount: number): string {
    const outputObj = {
      _declaration: {
        _attributes: {
          version: "1.0",
          encoding: "UTF-8",
        },
      },
      checkstyle: {
        _attributes: {
          version: "8.36",
        },
        file: [] as any,
      },
    };

    if (issues.length > 0) {
      for (const issue of issues) {
        outputObj.checkstyle.file.push({
          _attributes: {
            name: issue.getFilename(),
          },
          error: {
            _attributes: {
              line: issue.getStart().getRow(),
              column: issue.getStart().getCol(),
              severity: issue.getSeverity().toString(),
              message: issue.getMessage(),
              source: "abaplint",
            },
          },
        });
      }
    }

    const xml = js2xml(outputObj, {compact: true, spaces: 2});

    return xml;
  }

}
