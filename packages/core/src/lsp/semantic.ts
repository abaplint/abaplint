import * as SemanticProtocol from "vscode-languageserver-protocol/lib/common/protocol.semanticTokens";
import {VirtualPosition} from "..";
import {Comment, Punctuation, String, StringTemplate, StringTemplateBegin, StringTemplateEnd, StringTemplateMiddle} from "../abap/1_lexer/tokens";
import {TokenNodeRegex} from "../abap/nodes";
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
  private static readonly tokenTypes: string[] = [];
  private static tokenTypeMap: {[name: string]: number};

  public constructor(reg: IRegistry) {
    this.reg = reg;
    if (SemanticHighlighting.tokenTypes.length === 0) {
      SemanticHighlighting.tokenTypeMap = {};

      for (const t in SemanticProtocol.SemanticTokenTypes) {
        SemanticHighlighting.tokenTypeMap[t] = SemanticHighlighting.tokenTypes.length;
        SemanticHighlighting.tokenTypes.push(t);
      }
    }
  }

  public semanticTokensLegend(): SemanticProtocol.SemanticTokensLegend {
    // https://code.visualstudio.com/api/language-extensions/semantic-highlight-guide#semantic-token-scope-map
    // https://microsoft.github.io/language-server-protocol/specifications/specification-3-17/#semanticTokenTypes
    return {
      tokenTypes: SemanticHighlighting.tokenTypes,
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
      } else if (s.getFirstToken().getStart() instanceof VirtualPosition) {
        continue;
      }
      for (const t of s.getTokenNodes()) {
        let tokenType = SemanticProtocol.SemanticTokenTypes.keyword;
        if (t.get() instanceof String
            || t.get() instanceof StringTemplate
            || t.get() instanceof StringTemplateBegin
            || t.get() instanceof StringTemplateEnd
            || t.get() instanceof StringTemplateMiddle) {
          tokenType = SemanticProtocol.SemanticTokenTypes.string;
        } else if (t.get() instanceof Comment) {
          tokenType = SemanticProtocol.SemanticTokenTypes.comment;
        } else if (t instanceof TokenNodeRegex || t.get() instanceof Punctuation) {
          tokenType = SemanticProtocol.SemanticTokenTypes.method;
        }
        const token = t.getFirstToken();

        tokens.push({
          line: token.getStart().getRow() - 1,
          startChar: token.getStart().getCol() - 1,
          length: token.getStr().length,
          tokenType: tokenType,
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
      ret.push(SemanticHighlighting.tokenTypeMap[t.tokenType]);
      ret.push(0); // no modifier logic implemented yet

      prevLine = t.line;
      prevChar = t.startChar;
    }
    return ret;
  }
}