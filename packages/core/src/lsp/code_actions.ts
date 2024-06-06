import * as LServer from "vscode-languageserver-types";
import {IRegistry} from "../_iregistry";
import {ICodeActionParams} from "./_interfaces";
import {Diagnostics} from "./diagnostics";
import {IEdit} from "../edit_helper";
import {Issue} from "../issue";
import {Position} from "../position";
import {LSPEdit} from "./_edit";

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
      const fix = i.getDefaultFix();
      if (fix !== undefined) {
        if (totals[i.getKey()] === undefined) {
          totals[i.getKey()] = 1;
        } else {
          totals[i.getKey()]++;
        }

        if (this.inRange(i, params.range) === true) {
          ret.push({
            title: "Apply fix, " + i.getKey(),
            kind: LServer.CodeActionKind.QuickFix,
            diagnostics: [Diagnostics.mapDiagnostic(i)],
            isPreferred: true,
            edit: LSPEdit.mapEdit(fix),
          });
          shown.add(i.getKey());
        }
      }

      for (const alternative of i.getAlternativeFixes() || []) {
        if (this.inRange(i, params.range) === true) {
          ret.push({
            title: alternative.description,
            kind: LServer.CodeActionKind.QuickFix,
            diagnostics: [Diagnostics.mapDiagnostic(i)],
            isPreferred: true,
            edit: LSPEdit.mapEdit(alternative.edit),
          });
          shown.add(i.getKey());
        }
      }
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
      if (i.getKey() !== key) {
        continue;
      }

      const fix = i.getDefaultFix();
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
      edit: LSPEdit.mapEdits(fixes),
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

}