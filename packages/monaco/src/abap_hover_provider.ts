import * as LServer from "vscode-languageserver-types";
import {LanguageServer} from "abaplint/lsp/language_server";
import {IRegistry} from "abaplint/_iregistry";

export class ABAPHoverProvider implements monaco.languages.HoverProvider {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  public provideHover(model: monaco.editor.ITextModel, position: monaco.Position): monaco.languages.ProviderResult<monaco.languages.Hover> {
    const ls = new LanguageServer(this.reg);
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