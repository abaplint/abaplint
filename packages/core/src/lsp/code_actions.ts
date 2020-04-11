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
    const totals: {[key: string]: number} = {};
    const shown = new Set<string>();

    const ret: LServer.CodeAction[] = [];
    for (const i of issues) {
      const fix = i.getFix();
      if (fix === undefined) {
        continue;
      }

      if (totals[i.getKey()] === undefined) {
        totals[i.getKey()] = 1;
      } else {
        totals[i.getKey()]++;
      }

      if (this.inRange(i, params.range) === false)  {
        continue;
      }

      ret.push({
        title: "Apply fix, " + i.getKey(),
        kind: LServer.CodeActionKind.QuickFix,
        diagnostics: [Diagnostics.mapDiagnostic(i)],
        isPreferred: true,
        edit: this.mapEdit(fix),
      });
      shown.add(i.getKey());
    }

    for (const s of shown) {
      if (totals[s] > 1) {
        const foo = this.fixAlls(s, issues);
        ret.push(foo);
      }
    }

    return ret;
  }

//////////////////////

  private fixAlls(key: string, issues: readonly Issue[]): LServer.CodeAction {
    const diagnostics: LServer.Diagnostic[] = [];
    const fixes: IEdit[] = [];

    for (const i of issues) {
      const fix = i.getFix();
      if (fix === undefined) {
        continue;
      }

      fixes.push(fix);
      diagnostics.push(Diagnostics.mapDiagnostic(i));
    }

    return {
      title: "Fix all, " + key,
      kind: LServer.CodeActionKind.QuickFix,
      diagnostics,
      isPreferred: true,
      edit: this.mapEdits(fixes),
    };
  }

  private inRange(i: Issue, range: LServer.Range): boolean {
    const start = new Position(range.start.line + 1, range.start.character + 1);
    const end = new Position(range.end.line + 1, range.end.character + 1);

    return i.getStart().isBetween(start, end)
      || i.getEnd().isBetween(start, end)
      || start.isBetween(i.getStart(), i.getEnd())
      || end.isBetween(i.getStart(), i.getEnd())
      || end.equals(i.getEnd());
  }

  private mapEdits(edits: IEdit[]): LServer.WorkspaceEdit {
    const workspace: LServer.WorkspaceEdit = {changes: {}};
    for (const edit of edits) {
      for (const filename in edit) {
        if (workspace.changes![filename] === undefined) {
          workspace.changes![filename] = [];
        }
        workspace.changes![filename] = workspace.changes![filename].concat(this.mapText(edit[filename]));
      }
    }
    return workspace;
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