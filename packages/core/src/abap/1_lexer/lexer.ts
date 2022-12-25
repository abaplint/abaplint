import {IFile} from "../../files/_ifile";
import {Position, VirtualPosition} from "../../position";
import {Token} from "./tokens/_token";
import {IABAPLexerResult} from "./lexer_result";
import {At, AtW, BracketLeft, BracketLeftW, BracketRight, BracketRightW, Comment, Dash, DashW, Identifier, InstanceArrow, InstanceArrowW, ParenLeft, ParenLeftW, ParenRight, ParenRightW, Plus, PlusW, Pragma, Punctuation, StaticArrow, StaticArrowW, StringTemplate, StringTemplateBegin, StringTemplateEnd, StringTemplateMiddle, StringToken, WAt, WAtW, WBracketLeft, WBracketLeftW, WBracketRight, WBracketRightW, WDash, WDashW, WInstanceArrow, WInstanceArrowW, WParenLeft, WParenLeftW, WParenRight, WParenRightW, WPlus, WPlusW, WStaticArrow, WStaticArrowW} from "./tokens";

class Buffer {
  private buf: string;

  public constructor() {
    this.buf = "";
  }

  public add(s: string): void {
    this.buf = this.buf + s;
  }

  public get(): string {
    return this.buf;
  }

  public clear(): void {
    this.buf = "";
  }

  public countIsEven(char: string): boolean {
    let count = 0;
    for (let i = 0; i < this.buf.length; i += 1) {
      if (this.buf.charAt(i) === char) {
        count += 1;
      }
    }
    return count % 2 === 0;
  }
}

class Stream {
  private readonly raw: string;
  private offset = -1;
  private row: number;
  private col: number;

  public constructor(raw: string) {
    this.raw = raw;
    this.row = 0;
    this.col = 0;
  }

  public advance(): boolean {
    if (this.currentChar() === "\n") {
      this.col = 1;
      this.row = this.row + 1;
    }

    if (this.offset === this.raw.length) {
      return false;
    }

    this.col = this.col + 1;

    this.offset = this.offset + 1;
    return true;
  }

  public getCol(): number {
    return this.col;
  }

  public getRow(): number {
    return this.row;
  }

  public prevChar(): string {
    if (this.offset - 1 < 0) {
      return "";
    }
    return this.raw.substr(this.offset - 1, 1);
  }

  public prevPrevChar(): string {
    if (this.offset - 2 < 0) {
      return "";
    }
    return this.raw.substr(this.offset - 2, 2);
  }

  public currentChar(): string {
    if (this.offset < 0) {
      return "\n"; // simulate newline at start of file to handle star(*) comments
    } else if (this.offset >= this.raw.length) {
      return "";
    }
    return this.raw.substr(this.offset, 1);
  }

  public nextChar(): string {
    if (this.offset + 2 > this.raw.length) {
      return "";
    }
    return this.raw.substr(this.offset + 1, 1);
  }

  public nextNextChar(): string {
    if (this.offset + 3 > this.raw.length) {
      return this.nextChar();
    }
    return this.raw.substr(this.offset + 1, 2);
  }

  public getRaw(): string {
    return this.raw;
  }

  public getOffset() {
    return this.offset;
  }
}

export class Lexer {
  private readonly ModeNormal: number = 1;
  private readonly ModePing: number = 2;
  private readonly ModeStr: number = 3;
  private readonly ModeTemplate: number = 4;
  private readonly ModeComment: number = 5;
  private readonly ModePragma: number = 6;

  private virtual: Position | undefined;
  private tokens: Token[];
  private m: number;
  private stream: Stream;
  private buffer: Buffer;

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

      let tok: Token | undefined = undefined;
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
    this.stream = new Stream(raw.replace(/\r/g, ""));
    this.buffer = new Buffer();

    for (;;) {
      const current = this.stream.currentChar();
      this.buffer.add(current);
      const buf = this.buffer.get();
      const ahead = this.stream.nextChar();
      const aahead = this.stream.nextNextChar();
      const prev = this.stream.prevChar();

      if (this.m === this.ModeNormal) {
        if (ahead === "'") {
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
        } else if (ahead === "\"" || (ahead === "*" && current === "\n")) {
// start comment
          this.add();
          this.m = this.ModeComment;
        } else if (ahead === " "
            || ahead === ":"
            || ahead === "."
            || ahead === ","
            || ahead === "-"
            || ahead === "+"
            || ahead === "("
            || ahead === ")"
            || ahead === "["
            || ahead === "]"
            || (ahead === "@" && buf.trim().length === 0)
            || aahead === "->"
            || aahead === "=>"
            || ahead === "\t"
            || ahead === "\n") {
          this.add();
        } else if (current === ">"
            && ahead !== " "
            && (prev === "-" || prev === "=")) {
// arrows
          this.add();
        } else if (buf === "."
            || buf === ","
            || buf === ":"
            || buf === "("
            || buf === ")"
            || buf === "["
            || buf === "]"
            || buf === "+"
            || buf === "@"
            || (buf === "-" && ahead !== ">")) {
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
          && (prev !== "\\" || this.stream.prevPrevChar() === "\\\\")) {
// end of template
        this.add();
        this.m = this.ModeNormal;
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