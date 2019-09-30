import * as monaco from "monaco-editor";
import {FileSystem} from "../filesystem";
import {LanguageServer} from "abaplint/lsp";

export class ABAPSymbolProvider implements monaco.languages.DocumentSymbolProvider {

  public provideDocumentSymbols(
      model: monaco.editor.ITextModel,
      token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.DocumentSymbol[]> {

    const ls = new LanguageServer(FileSystem.getRegistry());
    const symbols = ls.documentSymbol({
      textDocument: {uri: FileSystem.getCurrentFile()},
    });

    const ret: monaco.languages.DocumentSymbol[] = [];

    for (const symbol of symbols) {
      ret.push({
        range: {
          startLineNumber: symbol.range.start.line,
          startColumn: symbol.range.start.character,
          endLineNumber: symbol.range.end.line,
          endColumn: symbol.range.end.character,
        },
        name: symbol.name,
        kind: symbol.kind,
        detail: symbol.detail ? symbol.detail : "",
        tags: [],
        selectionRange: {
          startLineNumber: symbol.selectionRange.start.line,
          startColumn: symbol.selectionRange.start.character,
          endLineNumber: symbol.selectionRange.end.line,
          endColumn: symbol.selectionRange.end.character,
        },
      });
    }

    return ret;
  }

}