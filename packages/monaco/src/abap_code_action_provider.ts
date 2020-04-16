import * as LServer from "vscode-languageserver-types";
import {LanguageServer, IRegistry} from "@abaplint/core";

export class ABAPCodeActionProvider implements monaco.languages.CodeActionProvider {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  public provideCodeActions(model: monaco.editor.ITextModel,
                            range: monaco.Range,
                            context: monaco.languages.CodeActionContext,
                            token: monaco.CancellationToken):
    monaco.languages.CodeActionList | Promise<monaco.languages.CodeActionList> {

    const ls = new LanguageServer(this.reg);

    const r: LServer.Range = {
      start: {line: range.startLineNumber - 1, character: range.startColumn - 1},
      end: {line: range.endLineNumber - 1, character: range.endColumn - 1}};

    const param = {
      textDocument: {uri: model.uri.toString()},
      range: r,
      context: {diagnostics: []},
    };

    const found = ls.codeActions(param);
    const actions: monaco.languages.CodeAction[] = [];

    for (const f of found) {
      if (f.edit === undefined) {
        continue;
      }

      actions.push({
        title: f.title,
        kind: f.kind,
        diagnostics: this.mapDiagnostics(f.diagnostics),
        edit: this.map(f.edit)});
    }

    const list: monaco.languages.CodeActionList = {
      actions: actions,
      dispose: () => { return; }};
    return list;
  }

  private mapDiagnostics(input?: LServer.Diagnostic[]): monaco.editor.IMarkerData[] {
    if (input === undefined) {
      return [];
    }

    const ret = [];
    for (const diagnostic of input) {
      ret.push({
        severity: monaco.MarkerSeverity.Error,
        message: diagnostic.message,
        startLineNumber: diagnostic.range.start.line + 1,
        startColumn: diagnostic.range.start.character + 1,
        endLineNumber: diagnostic.range.end.line + 1,
        endColumn: diagnostic.range.end.character + 1,
      });
    }

    return [];
  }

  private map(input: LServer.WorkspaceEdit): monaco.languages.WorkspaceEdit {
    const edits: monaco.languages.WorkspaceTextEdit[] = [];

    for (const filename in input.changes) {
      for (const c of input.changes[filename]) {
        edits.push({
          resource: monaco.Uri.parse(filename),
          edit: this.mapText(c)});
      }
    }
    return {edits};
  }

  private mapText(input: LServer.TextEdit): monaco.languages.TextEdit {
    const i = input;

    return {range: new monaco.Range(
      i.range.start.line + 1,
      i.range.start.character + 1,
      i.range.end.line + 1,
      i.range.end.character + 1), text: i.newText};
  }

}
