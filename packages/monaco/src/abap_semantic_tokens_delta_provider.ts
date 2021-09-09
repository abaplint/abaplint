import {IRegistry, LanguageServer} from "@abaplint/core";

export class ABAPSemanticTokensDeltaProvider implements monaco.languages.DocumentRangeSemanticTokensProvider {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  public getLegend(): monaco.languages.SemanticTokensLegend {
    return LanguageServer.semanticTokensLegend();
  }

  public provideDocumentRangeSemanticTokens(model: monaco.editor.ITextModel, range: monaco.Range, token: monaco.CancellationToken):
  monaco.languages.ProviderResult<monaco.languages.SemanticTokens> {
    const result = new LanguageServer(this.reg).semanticTokensRange({
      textDocument: {uri: model.uri.toString()},
      start: {line: range.startLineNumber, character: range.startColumn},
      end: {line: range.endLineNumber, character: range.endColumn},
    });

    const data = Uint32Array.from(result.data);

    return {data};
  }

}