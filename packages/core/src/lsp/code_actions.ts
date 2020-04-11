import * as LServer from "vscode-languageserver-types";
import {IRegistry} from "../_iregistry";
import {ICodeActionParams} from "./_interfaces";
import {Diagnostics} from "./diagnostics";
import {IEdit, ITextEdit} from "../edit";
import {Issue} from "../issue";
import {Position} from "../position";

export class CodeActions {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  public find(params: ICodeActionParams): LServer.CodeAction[] {
    const diag = new Diagnostics(this.reg);
    const issues = diag.findIssues(params.textDocument);

    const ret: LServer.CodeAction[] = [];
    for (const i of issues) {
      const fix = i.getFix();
      if (fix === undefined || this.inRange(i, params.range) === false)  {
        continue;
      }

      ret.push({
        title: "Apply fix, " + i.getKey(),
        kind: LServer.CodeActionKind.QuickFix,
        diagnostics: [diag.mapDiagnostic(i)],
        edit: this.mapEdit(fix),
      });
    }

    return ret;
  }

//////////////////////

  private inRange(i: Issue, range: LServer.Range): boolean {
    const start = new Position(range.start.line + 1, range.start.character + 1);
    const end = new Position(range.end.line + 1, range.end.character + 1);

    return i.getStart().isBetween(start, end)
      || i.getEnd().isBetween(start, end)
      || start.isBetween(i.getStart(), i.getEnd())
      || end.isBetween(i.getStart(), i.getEnd())
      || end.equals(i.getEnd());
  }

  private mapEdit(edit: IEdit): LServer.WorkspaceEdit {
    const workspace: LServer.WorkspaceEdit = {changes: {}};
    for (const filename in edit) {
      workspace.changes![filename] = this.mapText(edit[filename]);
    }
    return workspace;
  }

  private mapText(edit: ITextEdit[]): LServer.TextEdit[] {
    const result: LServer.TextEdit[] = [];

    for (const e of edit) {
      const range = LServer.Range.create(
        e.range.start.getRow() - 1,
        e.range.start.getCol() - 1,
        e.range.end.getRow() - 1,
        e.range.end.getCol() - 1);

      result.push({range, newText: e.newText});
    }

    return result;
  }

}