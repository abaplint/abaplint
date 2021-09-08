import * as SemanticProtocol from "vscode-languageserver-protocol/lib/common/protocol.semanticTokens";
import {IRegistry} from "../_iregistry";
import {ITextDocumentRange} from "./_interfaces";
import {LSPUtils} from "./_lsp_utils";

export class SemanticHighlighting {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  public semanticTokensLegend(): SemanticProtocol.SemanticTokensLegend {
    // todo
    // https://code.visualstudio.com/api/language-extensions/semantic-highlight-guide#semantic-token-scope-map
    return {
      tokenTypes: [SemanticProtocol.SemanticTokenTypes.keyword],
      tokenModifiers: [],
    };
  }

  public semanticTokensRange(range: ITextDocumentRange): SemanticProtocol.SemanticTokens {
    const file = LSPUtils.getABAPFile(this.reg, range.textDocument.uri);
    if (file === undefined) {
      return {data: []};
    }

// todo

    return {data: []};
  }
}