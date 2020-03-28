import * as LServer from "vscode-languageserver-types";
import {IRegistry} from "../_iregistry";
import {LSPUtils} from "./_lsp_utils";

export class Diagnostics {

  public static find(reg: IRegistry, textDocument: LServer.TextDocumentIdentifier): LServer.Diagnostic[] {

    const file = LSPUtils.getABAPFile(reg, textDocument.uri); // todo, this sould also run for xml files
    if (file === undefined) {
      return [];
    }

    const obj = reg.findObjectForFile(file);
    if (obj === undefined) {
      return [];
    }

    const diagnostics: LServer.Diagnostic[] = [];
    for (const issue of reg.findIssuesObject(obj)) {
      if (issue.getFilename() !== file.getFilename()) {
        continue;
      }
      const diagnosic: LServer.Diagnostic = {
        severity: LServer.DiagnosticSeverity.Error,
        range: {
          start: {line: issue.getStart().getRow() - 1, character: issue.getStart().getCol() - 1},
          end: {line: issue.getEnd().getRow() - 1, character: issue.getEnd().getCol() - 1},
        },
        code: issue.getKey(),
        message: issue.getMessage().toString(),
        source: "abaplint",
      };

      diagnostics.push(diagnosic);
    }

    return diagnostics;
  }

}