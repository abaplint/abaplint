import * as monaco from "monaco-editor";
import {FileSystem} from "../filesystem";
import {LanguageServer} from "abaplint/lsp";

export class ABAPFormattingProvider implements monaco.languages.DocumentFormattingEditProvider {

  public provideDocumentFormattingEdits(
      model: monaco.editor.ITextModel,
      options: monaco.languages.FormattingOptions,
      token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.TextEdit[]> {

    const ls = new LanguageServer(FileSystem.getRegistry());
    const edit = ls.documentFormatting({
      textDocument: {uri: FileSystem.getCurrentFile()},
    });

    if (edit && edit.length === 1) {
      return [{
        range: {
          startLineNumber: edit[0].range.start.line,
          startColumn: edit[0].range.start.character,
          endLineNumber: edit[0].range.end.line,
          endColumn: edit[0].range.end.character,
        },
        text: edit[0].newText,
      }];
    } else {
      return undefined;
    }
  }

}