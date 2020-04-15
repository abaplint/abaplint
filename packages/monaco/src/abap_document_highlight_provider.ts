import {LanguageServer} from "abaplint/lsp/language_server";
import {IRegistry} from "abaplint/_iregistry";

export class ABAPDocumentHighlightProvider implements monaco.languages.DocumentHighlightProvider {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  public provideDocumentHighlights(model: monaco.editor.ITextModel,
                                   position: monaco.Position,
                                   token: monaco.CancellationToken):
    monaco.languages.ProviderResult<monaco.languages.DocumentHighlight[]> {

    const ls = new LanguageServer(this.reg);

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