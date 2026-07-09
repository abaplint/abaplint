import {IFile} from "../../files/_ifile";
import {Position} from "../../position";
import {VirtualPosition} from "../../virtual_position";
import {AbstractToken} from "./tokens/abstract_token";
import {IABAPLexerResult} from "./lexer_result";
import {At, AtW, AssociationName, BracketLeft, BracketLeftW, BracketRight, BracketRightW, Comment, Dash, DashW, Identifier, InstanceArrow, InstanceArrowW, ParenLeft, ParenLeftW, ParenRight, ParenRightW, Plus, PlusW, Pragma, Punctuation, StaticArrow, StaticArrowW, StringTemplate, StringTemplateBegin, StringTemplateEnd, StringTemplateMiddle, StringToken, WAt, WAtW, WBracketLeft, WBracketLeftW, WBracketRight, WBracketRightW, WDash, WDashW, WInstanceArrow, WInstanceArrowW, WParenLeft, WParenLeftW, WParenRight, WParenRightW, WPlus, WPlusW, WStaticArrow, WStaticArrowW} from "./tokens";
import {LexerBuffer} from "./lexer_buffer";
import {LexerStream} from "./lexer_stream";

const ModeNormal: number = 1;
const ModePing: number = 2;
const ModeStr: number = 3;
const ModeTemplate: number = 4;
const ModeComment: number = 5;
const ModePragma: number = 6;

// character codes, used for integer comparisons in the hot loop
const EOF = -1;             // no character (start/end of file)
const CH_TAB = 9;           // "\t"
const CH_NL = 10;           // "\n"
const CH_SPACE = 32;        // " "
const CH_DQUOTE = 34;       // "\""
const CH_HASH = 35;         // "#"
const CH_QUOTE = 39;        // "'"
const CH_STAR = 42;         // "*"
const CH_DASH = 45;         // "-"
const CH_COMMA = 44;        // ","
const CH_DOT = 46;          // "."
const CH_COLON = 58;        // ":"
const CH_EQUALS = 61;       // "="
const CH_GT = 62;           // ">"
const CH_AT = 64;           // "@"
const CH_BACKSLASH = 92;    // "\\"
const CH_BACKTICK = 96;     // "`"
const CH_LBRACE = 123;      // "{"
const CH_PIPE = 124;        // "|"
const CH_RBRACE = 125;      // "}"

// characters that terminate the current token
const SPLITS = new Set<number>([
  CH_SPACE, CH_COLON, CH_DOT, CH_COMMA, CH_DASH, 43 /* + */, 40 /* ( */,
  41 /* ) */, 91 /* [ */, 93 /* ] */, CH_BACKSLASH, CH_TAB, CH_NL]);

// single characters that are emitted as their own token
const BUFS = new Set<number>([
  CH_DOT, CH_COMMA, CH_COLON, 40 /* ( */, 41 /* ) */, 91 /* [ */,
  93 /* ] */, 43 /* + */, CH_AT]);

export class Lexer {

  private virtual: Position | undefined;
  private tokens: AbstractToken[];
  private m: number;
  private stream: LexerStream;
  private buffer: LexerBuffer;

  public run(file: IFile, virtual?: Position): IABAPLexerResult {
    this.virtual = virtual;
    this.tokens = [];
    this.m = ModeNormal;

    this.process(file.getRaw());
    return {file, tokens: this.tokens};
  }

  private add() {
    const s = this.buffer.get().trim();
    if (s.length > 0) {
      const col = this.stream.getCol();
      const row = this.stream.getRow();

      let whiteBefore = false;
      const beforeOffset = this.stream.getOffset() - s.length;
      if (beforeOffset >= 0) {
        const prev = this.stream.charCodeAt(beforeOffset);
        if (prev === CH_SPACE || prev === CH_NL || prev === CH_TAB || prev === CH_COLON) {
          whiteBefore = true;
        }
      }

      let whiteAfter = false;
      const next = this.stream.nextChar();
      if (next === CH_SPACE || next === CH_NL || next === CH_TAB || next === CH_COLON
          || next === CH_COMMA || next === CH_DOT || next === EOF || next === CH_DQUOTE) {
        whiteAfter = true;
      }

      let pos = new Position(row, col - s.length);
      if (this.virtual) {
        pos = new VirtualPosition(this.virtual, pos.getRow(), pos.getCol());
      }

      let tok: AbstractToken | undefined = undefined;
      if (this.m === ModeComment) {
        tok = new Comment(pos, s);
      } else if (this.m === ModePing || this.m === ModeStr) {
        tok = new StringToken(pos, s);
      } else if (this.m === ModeTemplate) {
        const first = s.charAt(0);
        const last = s.charAt(s.length - 1);
        if (first === "|" && last === "|") {
          tok = new StringTemplate(pos, s);
        } else if (first === "|" && last === "{" && whiteAfter === true) {
          tok = new StringTemplateBegin(pos, s);
        } else if (first === "}" && last === "|" && whiteBefore === true) {
          tok = new StringTemplateEnd(pos, s);
        } else if (first === "}" && last === "{" && whiteAfter === true && whiteBefore === true) {
          tok = new StringTemplateMiddle(pos, s);
        } else {
          tok = new Identifier(pos, s);
        }
      } else if (s.length > 2 && s.substr(0, 2) === "##") {
        tok = new Pragma(pos, s);
      } else if (s.length === 1) {
        if (s === "." || s === ",") {
          tok = new Punctuation(pos, s);
        } else if (s === "[") {
          if (whiteBefore === true && whiteAfter === true) {
            tok = new WBracketLeftW(pos, s);
          } else if (whiteBefore === true) {
            tok = new WBracketLeft(pos, s);
          } else if (whiteAfter === true) {
            tok = new BracketLeftW(pos, s);
          } else {
            tok = new BracketLeft(pos, s);
          }
        } else if (s === "(") {
          if (whiteBefore === true && whiteAfter === true) {
            tok = new WParenLeftW(pos, s);
          } else if (whiteBefore === true) {
            tok = new WParenLeft(pos, s);
          } else if (whiteAfter === true) {
            tok = new ParenLeftW(pos, s);
          } else {
            tok = new ParenLeft(pos, s);
          }
        } else if (s === "]") {
          if (whiteBefore === true && whiteAfter === true) {
            tok = new WBracketRightW(pos, s);
          } else if (whiteBefore === true) {
            tok = new WBracketRight(pos, s);
          } else if (whiteAfter === true) {
            tok = new BracketRightW(pos, s);
          } else {
            tok = new BracketRight(pos, s);
          }
        } else if (s === ")") {
          if (whiteBefore === true && whiteAfter === true) {
            tok = new WParenRightW(pos, s);
          } else if (whiteBefore === true) {
            tok = new WParenRight(pos, s);
          } else if (whiteAfter === true) {
            tok = new ParenRightW(pos, s);
          } else {
            tok = new ParenRight(pos, s);
          }
        } else if (s === "-") {
          if (whiteBefore === true && whiteAfter === true) {
            tok = new WDashW(pos, s);
          } else if (whiteBefore === true) {
            tok = new WDash(pos, s);
          } else if (whiteAfter === true) {
            tok = new DashW(pos, s);
          } else {
            tok = new Dash(pos, s);
          }
        } else if (s === "+") {
          if (whiteBefore === true && whiteAfter === true) {
            tok = new WPlusW(pos, s);
          } else if (whiteBefore === true) {
            tok = new WPlus(pos, s);
          } else if (whiteAfter === true) {
            tok = new PlusW(pos, s);
          } else {
            tok = new Plus(pos, s);
          }
        } else if (s === "@") {
          if (whiteBefore === true && whiteAfter === true) {
            tok = new WAtW(pos, s);
          } else if (whiteBefore === true) {
            tok = new WAt(pos, s);
          } else if (whiteAfter === true) {
            tok = new AtW(pos, s);
          } else {
            tok = new At(pos, s);
          }
        }
      } else if (s.length === 2) {
        if (s === "->") {
          if (whiteBefore === true && whiteAfter === true) {
            tok = new WInstanceArrowW(pos, s);
          } else if (whiteBefore === true) {
            tok = new WInstanceArrow(pos, s);
          } else if (whiteAfter === true) {
            tok = new InstanceArrowW(pos, s);
          } else {
            tok = new InstanceArrow(pos, s);
          }
        } else if (s === "=>") {
          if (whiteBefore === true && whiteAfter === true) {
            tok = new WStaticArrowW(pos, s);
          } else if (whiteBefore === true) {
            tok = new WStaticArrow(pos, s);
          } else if (whiteAfter === true) {
            tok = new StaticArrowW(pos, s);
          } else {
            tok = new StaticArrow(pos, s);
          }
        }
      }

      if (tok === undefined && this.m === ModeNormal && s.charAt(0) === "\\") {
        const adj = this.stream.nextChar() === EOF ? 1 : 0;
        const prevOffset = this.stream.getOffset() - s.length - adj;
        const prevChar = this.stream.charCodeAt(prevOffset);
        const whiteBeforeBackslash = prevChar === CH_SPACE || prevChar === CH_NL || prevChar === CH_TAB || prevChar === CH_COLON;
        if (!whiteBeforeBackslash) {
          tok = new AssociationName(pos, s);
        }
      }

      if (tok === undefined) {
        tok = new Identifier(pos, s);
      }
      this.tokens.push(tok);
    }
    this.buffer.clear();
  }

  private process(raw: string) {
    const stream = new LexerStream(raw.replace(/\r/g, ""));
    this.stream = stream;
    this.buffer = new LexerBuffer(stream.getRaw());

    for (;;) {
      const current = stream.currentChar();
      this.buffer.add(stream.getOffset());
      const ahead = stream.nextChar();
      const aahead = stream.nextNextChar();

      if (this.m === ModeNormal) {
        if (SPLITS.has(ahead)) {
          this.add();
        } else if (ahead === CH_QUOTE) {
// start string
          this.add();
          this.m = ModeStr;
        } else if (ahead === CH_PIPE || ahead === CH_RBRACE) {
// start template
          this.add();
          this.m = ModeTemplate;
        } else if (ahead === CH_BACKTICK) {
// start ping
          this.add();
          this.m = ModePing;
        } else if (ahead === CH_HASH && aahead === CH_HASH) {
// start pragma
          this.add();
          this.m = ModePragma;
        } else if (ahead === CH_DQUOTE
            || (ahead === CH_STAR && current === CH_NL)) {
// start comment
          this.add();
          this.m = ModeComment;
        } else if (ahead === CH_AT && this.buffer.get().trim().length === 0) {
          this.add();
        } else if ((ahead === CH_DASH || ahead === CH_EQUALS) && aahead === CH_GT) {
          this.add();
        } else if (current === CH_GT
            && ahead !== CH_SPACE
            && (stream.prevChar() === CH_DASH || stream.prevChar() === CH_EQUALS)) {
// arrows
          this.add();
        } else if (this.buffer.length() === 1
            && (BUFS.has(current)
            || (current === CH_DASH && ahead !== CH_GT))) {
          this.add();
        }
      } else if (this.m === ModePragma && (ahead === CH_COMMA || ahead === CH_COLON
        || ahead === CH_DOT || ahead === CH_SPACE || ahead === CH_NL)) {
// end of pragma
        this.add();
        this.m = ModeNormal;
      } else if (this.m === ModePing
          && this.buffer.length() > 1
          && current === CH_BACKTICK
          && !(ahead === CH_BACKTICK && aahead === CH_BACKTICK)
          && ahead !== CH_BACKTICK
          && this.buffer.countIsEven(CH_BACKTICK)) {
// end of ping
        this.add();
        if (ahead === CH_DQUOTE) {
          this.m = ModeComment;
        } else {
          this.m = ModeNormal;
        }
      } else if (this.m === ModeTemplate
          && this.buffer.length() > 1
          && (current === CH_PIPE || current === CH_LBRACE)
          && (stream.prevChar() !== CH_BACKSLASH || (stream.prevPrevChar() === CH_BACKSLASH && stream.prevChar() === CH_BACKSLASH))) {
// end of template
        this.add();
        this.m = ModeNormal;
      } else if (this.m === ModeTemplate
          && ahead === CH_RBRACE
          && current !== CH_BACKSLASH) {
        this.add();
      } else if (this.m === ModeStr
          && current === CH_QUOTE
          && this.buffer.length() > 1
          && !(ahead === CH_QUOTE && aahead === CH_QUOTE)
          && ahead !== CH_QUOTE
          && this.buffer.countIsEven(CH_QUOTE)) {
// end of string
        this.add();
        if (ahead === CH_DQUOTE) {
          this.m = ModeComment;
        } else {
          this.m = ModeNormal;
        }
      } else if (ahead === CH_NL && this.m !== ModeTemplate) {
        this.add();
        this.m = ModeNormal;
      } else if (this.m === ModeTemplate && current === CH_NL) {
        this.add();
      }

      if (!stream.advance()) {
        break;
      }
    }

    this.add();
  }

}