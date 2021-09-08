import * as SemanticProtocol from "vscode-languageserver-protocol/lib/common/protocol.semanticTokens";
import {Position} from "../position";
import {IRegistry} from "../_iregistry";
import {ITextDocumentRange} from "./_interfaces";
import {LSPUtils} from "./_lsp_utils";

interface Token {
  line: number,
  startChar: number,
  length: number,
  tokenType: string,
  tokenModifiers: string[],
}

export class SemanticHighlighting {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  public semanticTokensLegend(): SemanticProtocol.SemanticTokensLegend {
    // https://code.visualstudio.com/api/language-extensions/semantic-highlight-guide#semantic-token-scope-map
    // https://microsoft.github.io/language-server-protocol/specifications/specification-3-17/#semanticTokenTypes
    return {
      tokenTypes: [SemanticProtocol.SemanticTokenTypes.keyword, SemanticProtocol.SemanticTokenTypes.variable],
      tokenModifiers: [],
    };
  }

  // https://microsoft.github.io/language-server-protocol/specifications/specification-3-17/#textDocument_semanticTokens
  public semanticTokensRange(range: ITextDocumentRange): SemanticProtocol.SemanticTokens {
    const file = LSPUtils.getABAPFile(this.reg, range.textDocument.uri);
    if (file === undefined) {
      return {data: []};
    }
    const rangeStartPosition = new Position(range.start.line + 1, range.start.character + 1);
    const rangeEndPosition = new Position(range.end.line + 1, range.end.character + 1);

    const tokens: Token[] = [];
    for (const s of file.getStatements()) {
      if (s.getFirstToken().getStart().isAfter(rangeEndPosition)) {
        break;
      } else if (s.getLastToken().getEnd().isBefore(rangeStartPosition)) {
        continue;
      }
      for (const t of s.getTokens()) {
        tokens.push({
          line: t.getStart().getRow() - 1,
          startChar: t.getStart().getCol() - 1,
          length: t.getStr().length,
          tokenType: SemanticProtocol.SemanticTokenTypes.keyword,
          tokenModifiers: [],
        });
      }
    }

    return {data: this.encodeTokens(tokens)};
  }

  private encodeTokens(tokens: Token[]): number[] {
    const ret: number[] = [];
    let prevLine: number | undefined = undefined;
    let prevChar: number | undefined = undefined;
    for (const t of tokens) {
      if (prevLine === undefined) {
        ret.push(t.line);
      } else {
        ret.push(t.line - prevLine);
      }
      if (prevLine === t.line && prevChar) {
        ret.push(t.startChar - prevChar);
      } else {
        ret.push(t.startChar); // todo, delta?
      }
      ret.push(t.length);
      ret.push(0); // everything as the first token type
      ret.push(0); // no modifier logic implemented yet

      prevLine = t.line;
      prevChar = t.startChar;
    }
    return ret;
  }
}