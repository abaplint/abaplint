import {IRegistry, LanguageServer} from "@abaplint/core";

export class ABAPSemanticTokensDeltaProvider implements monaco.languages.DocumentRangeSemanticTokensProvider {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  public getLegend(): monaco.languages.SemanticTokensLegend {
    console.dir("getLegend Semantic Tokens");
    return new LanguageServer(this.reg).semanticTokensLegend();
  }

  public provideDocumentRangeSemanticTokens(model: monaco.editor.ITextModel, range: monaco.Range, token: monaco.CancellationToken):
  monaco.languages.ProviderResult<monaco.languages.SemanticTokens> {
    console.dir("provideDocumentRangeSemanticTokens");
    console.dir(range);
    new LanguageServer(this.reg).semanticTokensRange({
      textDocument: {uri: model.uri.toString()},
      start: {line: range.startLineNumber - 1, character: range.startColumn - 1},
      end: {line: range.endLineNumber - 1, character: range.endColumn - 1},
    });

    const data = new Uint32Array();
    return {data};
  }

}