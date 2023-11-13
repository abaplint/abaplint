import {IFile} from "../../files/_ifile";
import {Position} from "../../position";
import {VirtualPosition} from "../../virtual_position";
import {AbstractToken} from "./tokens/abstract_token";
import {IABAPLexerResult} from "./lexer_result";
import {At, AtW, BracketLeft, BracketLeftW, BracketRight, BracketRightW, Comment, Dash, DashW, Identifier, InstanceArrow, InstanceArrowW, ParenLeft, ParenLeftW, ParenRight, ParenRightW, Plus, PlusW, Pragma, Punctuation, StaticArrow, StaticArrowW, StringTemplate, StringTemplateBegin, StringTemplateEnd, StringTemplateMiddle, StringToken, WAt, WAtW, WBracketLeft, WBracketLeftW, WBracketRight, WBracketRightW, WDash, WDashW, WInstanceArrow, WInstanceArrowW, WParenLeft, WParenLeftW, WParenRight, WParenRightW, WPlus, WPlusW, WStaticArrow, WStaticArrowW} from "./tokens";
import {LexerBuffer} from "./lexer_buffer";
import {LexerStream} from "./lexer_stream";

export class Lexer {
  private readonly ModeNormal: number = 1;
  private readonly ModePing: number = 2;
  private readonly ModeStr: number = 3;
  private readonly ModeTemplate: number = 4;
  private readonly ModeComment: number = 5;
  private readonly ModePragma: number = 6;

  private virtual: Position | undefined;
  private tokens: AbstractToken[];
  private m: number;
  private stream: LexerStream;
  private buffer: LexerBuffer;

  public run(file: IFile, virtual?: Position): IABAPLexerResult {
    this.virtual = virtual;
    this.tokens = [];
    this.m = this.ModeNormal;

    this.process(file.getRaw());
    return {file, tokens: this.tokens};
  }

  private add() {
    const s = this.buffer.get().trim();
    if (s.length > 0) {
      const col = this.stream.getCol();
      const row = this.stream.getRow();

      let whiteBefore = false;
      if (this.stream.getOffset() - s.length >= 0) {
        const prev = this.stream.getRaw().substr(this.stream.getOffset() - s.length, 1);
        if (prev === " " || prev === "\n" || prev === "\t" || prev === ":") {
          whiteBefore = true;
        }
      }

      let whiteAfter = false;
      const next = this.stream.nextChar();
      if (next === " " || next === "\n" || next === "\t" || next === ":" || next === "," || next === "." || next === "" || next === "\"") {
        whiteAfter = true;
      }

      let pos = new Position(row, col - s.length);
      if (this.virtual) {
        pos = new VirtualPosition(this.virtual, pos.getRow(), pos.getCol());
      }

      let tok: AbstractToken | undefined = undefined;
      if (this.m === this.ModeComment) {
        tok = new Comment(pos, s);
      } else if (this.m === this.ModePing || this.m === this.ModeStr) {
        tok = new StringToken(pos, s);
      } else if (this.m === this.ModeTemplate) {
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

      if (tok === undefined) {
        tok = new Identifier(pos, s);
      }
      this.tokens.push(tok);
    }
    this.buffer.clear();
  }

  private process(raw: string) {
    this.stream = new LexerStream(raw.replace(/\r/g, ""));
    this.buffer = new LexerBuffer();

    const splits: {[name: string]: boolean} = {};
    splits[" "] = true;
    splits[":"] = true;
    splits["."] = true;
    splits[","] = true;
    splits["-"] = true;
    splits["+"] = true;
    splits["("] = true;
    splits[")"] = true;
    splits["["] = true;
    splits["]"] = true;
    splits["\t"] = true;
    splits["\n"] = true;

    const bufs: {[name: string]: boolean} = {};
    bufs["."] = true;
    bufs[","] = true;
    bufs[":"] = true;
    bufs["("] = true;
    bufs[")"] = true;
    bufs["["] = true;
    bufs["]"] = true;
    bufs["+"] = true;
    bufs["@"] = true;

    for (;;) {
      const current = this.stream.currentChar();
      const buf = this.buffer.add(current);
      const ahead = this.stream.nextChar();
      const aahead = this.stream.nextNextChar();

      if (this.m === this.ModeNormal) {
        if (splits[ahead]) {
          this.add();
        } else if (ahead === "'") {
// start string
          this.add();
          this.m = this.ModeStr;
        } else if (ahead === "|" || ahead === "}") {
// start template
          this.add();
          this.m = this.ModeTemplate;
        } else if (ahead === "`") {
// start ping
          this.add();
          this.m = this.ModePing;
        } else if (aahead === "##") {
// start pragma
          this.add();
          this.m = this.ModePragma;
        } else if (ahead === "\""
            || (ahead === "*" && current === "\n")) {
// start comment
          this.add();
          this.m = this.ModeComment;
        } else if (ahead === "@" && buf.trim().length === 0) {
          this.add();
        } else if (aahead === "->"
            || aahead === "=>") {
          this.add();
        } else if (current === ">"
            && ahead !== " "
            && (this.stream.prevChar() === "-" || this.stream.prevChar() === "=")) {
// arrows
          this.add();
        } else if (buf.length === 1
            && (bufs[buf]
            || (buf === "-" && ahead !== ">"))) {
          this.add();
        }
      } else if (this.m === this.ModePragma && (ahead === "," || ahead === ":" || ahead === "." || ahead === " " || ahead === "\n")) {
// end of pragma
        this.add();
        this.m = this.ModeNormal;
      } else if (this.m === this.ModePing
          && buf.length > 1
          && current === "`"
          && aahead !== "``"
          && ahead !== "`"
          && this.buffer.countIsEven("`")) {
// end of ping
        this.add();
        if (ahead === `"`) {
          this.m = this.ModeComment;
        } else {
          this.m = this.ModeNormal;
        }
      } else if (this.m === this.ModeTemplate
          && buf.length > 1
          && (current === "|" || current === "{")
          && (this.stream.prevChar() !== "\\" || this.stream.prevPrevChar() === "\\\\")) {
// end of template
        this.add();
        this.m = this.ModeNormal;
      } else if (this.m === this.ModeTemplate
          && ahead === "}"
          && current !== "\\") {
        this.add();
      } else if (this.m === this.ModeStr
          && current === "'"
          && buf.length > 1
          && aahead !== "''"
          && ahead !== "'"
          && this.buffer.countIsEven("'")) {
// end of string
        this.add();
        if (ahead === "\"") {
          this.m = this.ModeComment;
        } else {
          this.m = this.ModeNormal;
        }
      } else if (ahead === "\n" && this.m !== this.ModeTemplate) {
        this.add();
        this.m = this.ModeNormal;
      } else if (this.m === this.ModeTemplate && current === "\n") {
        this.add();
      }

      if (!this.stream.advance()) {
        break;
      }
    }

    this.add();
  }

}