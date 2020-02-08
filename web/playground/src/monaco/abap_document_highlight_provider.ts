import {LanguageServer} from "abaplint/lsp";
import {FileSystem} from "../filesystem";
import * as monaco from "monaco-editor";

export class ABAPDocumentHighlightProvider implements monaco.languages.DocumentHighlightProvider {

  public provideDocumentHighlights(model: monaco.editor.ITextModel,
                                   position: monaco.Position,
                                   token: monaco.CancellationToken):
    monaco.languages.ProviderResult<monaco.languages.DocumentHighlight[]> {

    const ls = new LanguageServer(FileSystem.getRegistry());

    const pos = {
      textDocument: {uri: model.uri.toString()},
      position: {line: position.lineNumber - 1, character: position.column - 1}};

    const ret: monaco.languages.DocumentHighlight[] = [];

    for (const found of ls.documentHighlight(pos)) {
      ret.push(
        {range: new monaco.Range(
          found.range.start.line + 1,
          found.range.start.character + 1,
          found.range.end.line + 1,
          found.range.end.character + 1),
        });
    }

    return ret;
  }

}