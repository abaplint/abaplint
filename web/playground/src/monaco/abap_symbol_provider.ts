import * as monaco from "monaco-editor";
import {LanguageServer} from "abaplint/lsp/language_server";
import {IRegistry} from "abaplint/_iregistry";

export class ABAPSymbolProvider implements monaco.languages.DocumentSymbolProvider {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  public provideDocumentSymbols(
    model: monaco.editor.ITextModel,
    token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.DocumentSymbol[]> {

    const ls = new LanguageServer(this.reg);
    const symbols = ls.documentSymbol({
      textDocument: {uri: model.uri.toString()},
    });

    const ret: monaco.languages.DocumentSymbol[] = [];

    for (const symbol of symbols) {
      ret.push({
        range: {
          startLineNumber: symbol.range.start.line + 1,
          startColumn: symbol.range.start.character + 1,
          endLineNumber: symbol.range.end.line + 1,
          endColumn: symbol.range.end.character + 1,
        },
        name: symbol.name,
        kind: symbol.kind,
        detail: symbol.detail ? symbol.detail : "",
        tags: [],
        selectionRange: {
          startLineNumber: symbol.selectionRange.start.line + 1,
          startColumn: symbol.selectionRange.start.character + 1,
          endLineNumber: symbol.selectionRange.end.line + 1,
          endColumn: symbol.selectionRange.end.character + 1,
        },
      });
    }

    return ret;
  }

}