import * as LServer from "vscode-languageserver-types";
import * as monaco from "monaco-editor";
import {LanguageServer} from "abaplint/lsp";
import {FileSystem} from "../filesystem";

export class ABAPHoverProvider implements monaco.languages.HoverProvider {

  public provideHover(model: monaco.editor.ITextModel, position: monaco.Position): monaco.languages.ProviderResult<monaco.languages.Hover> {
    const ls = new LanguageServer(FileSystem.getRegistry());
    const hov = ls.hover({
      textDocument: {uri: model.uri.toString()},
      position: {line: position.lineNumber - 1, character: position.column - 1}}) as {contents: LServer.MarkupContent} | undefined;
    if (hov) {
      return {
        range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
        contents: [{value: hov.contents.value}],
      };
    } else {
      return undefined;
    }
  }

}