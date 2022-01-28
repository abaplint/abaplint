import * as LServer from "vscode-languageserver-types";
import {IRegistry} from "../_iregistry";
import {LSPUtils} from "./_lsp_utils";
import {Issue} from "../issue";
import {Severity} from "../severity";

export class Diagnostics {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  public findIssues(textDocument: LServer.TextDocumentIdentifier): readonly Issue[] {
    this.reg.parse();

    const file = LSPUtils.getABAPFile(this.reg, textDocument.uri); // todo, this sould also run for xml files
    if (file === undefined) {
      return [];
    }

    const obj = this.reg.findObjectForFile(file);
    if (obj === undefined) {
      return [];
    }

    let issues = this.reg.findIssuesObject(obj);
    issues = issues.filter(i => i.getFilename() === file.getFilename());
    return issues;
  }

  public static mapDiagnostic(issue: Issue): LServer.Diagnostic {
    const diagnosic: LServer.Diagnostic = {
      severity: this.mapSeverity(issue.getSeverity()),
      range: {
        start: {line: issue.getStart().getRow() - 1, character: issue.getStart().getCol() - 1},
        end: {line: issue.getEnd().getRow() - 1, character: issue.getEnd().getCol() - 1},
      },
      code: issue.getKey(),
      codeDescription: {href: "https://rules.abaplint.org/" + issue.getKey() + "/"},
      message: issue.getMessage().toString(),
      source: "abaplint",
    };

    return diagnosic;
  }

  public find(textDocument: LServer.TextDocumentIdentifier): LServer.Diagnostic[] {
    const issues = this.findIssues(textDocument);

    const diagnostics: LServer.Diagnostic[] = [];
    for (const issue of issues) {
      diagnostics.push(Diagnostics.mapDiagnostic(issue));
    }

    return diagnostics;
  }

  private static mapSeverity(severity: Severity): LServer.DiagnosticSeverity {
    switch (severity) {
      case Severity.Error:
        return LServer.DiagnosticSeverity.Error;
      case Severity.Warning:
        return LServer.DiagnosticSeverity.Warning;
      case Severity.Info:
        return LServer.DiagnosticSeverity.Information;
      default:
        return LServer.DiagnosticSeverity.Error;
    }
  }

}