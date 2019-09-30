import * as monaco from "monaco-editor";
// import {FileSystem} from "../filesystem";
// import {LanguageServer} from "abaplint/lsp";

export class ABAPCodeActionProvider implements monaco.languages.CodeActionProvider {

  public provideCodeActions(
      model: monaco.editor.ITextModel,
      range: monaco.Range,
      context: monaco.languages.CodeActionContext,
      token: monaco.CancellationToken): monaco.languages.CodeActionList | Promise<monaco.languages.CodeActionList> {

// todo
/*
    const ls = new LanguageServer(FileSystem.getRegistry());
    const diagnostics = ls.diagnostics({uri: FileSystem.getCurrentFile()});

    console.dir(diagnostics);
    const ret: monaco.languages.CodeAction[] = [];

    for (const diagnostic of diagnostics) {
      const marker = {
        severity: monaco.MarkerSeverity.Error,
        message: diagnostic.message,
        startLineNumber: diagnostic.range.start.line + 1,
        startColumn: diagnostic.range.start.character + 1,
        endLineNumber: diagnostic.range.end.line + 1,
        endColumn: diagnostic.range.end.character + 1,
      };

      ret.push({
        title: "something",
        diagnostics: [marker],
      });
    }

    return {actions: ret, dispose: () => { return; }};
    */
    return {actions: [], dispose: () => { return; }};

  }

}