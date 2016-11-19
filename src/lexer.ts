import * as Tokens from "./tokens/";
import {File} from "./file";
import Position from "./position";

enum Mode {
  Normal,
  Ping,
  Str,
  Template,
  Comment,
}

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
}

class Stream {
  private raw: string;
  private offset = -1;
  private row;
  private col;

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
    return this.raw.substr(this.offset - 1, 1);
  }

  public currentChar(): string {
    if (this.offset < 0) {
      return "\n"; // simulate newline at start of file to handle star(*) comments
    }
    return this.raw.substr(this.offset, 1);
  }

  public nextChar(): string {
    return this.raw.substr(this.offset + 1, 1);
  }

  public nextNextChar(): string {
    return this.raw.substr(this.offset + 1, 2);
  }
}

export default class Lexer {
  private static tokens: Array<Tokens.Token>;
  private static m: Mode;
  private static stream: Stream;
  private static buffer: Buffer;

  public static run(file: File): Array<Tokens.Token> {
    this.tokens = [];
    this.m = Mode.Normal;

    this.process(file.getRaw());
// console.dir(this.tokens);
    return this.tokens;
  }

  private static add() {
    let s = this.buffer.get().trim();
    if (s.length > 0) {
      let col = this.stream.getCol();
      let row = this.stream.getRow();

      let whiteBefore = false;
      if (this.stream.prevChar() === " ") {
        whiteBefore = true;
      }

      let whiteAfter = false;
      if (this.stream.nextChar() === " " || this.stream.nextChar() === "\n") {
        whiteAfter = true;
      }

      let tok: Tokens.Token;
      let pos = new Position(row, col - s.length);

      if (this.m === Mode.Comment) {
        tok = new Tokens.Comment(pos, s);
      } else if (this.m === Mode.Ping || this.m === Mode.Str) {
        tok = new Tokens.String(pos, s);
      } else if (this.m === Mode.Template) {
        tok = new Tokens.StringTemplate(pos, s);
      } else if (s.substr(0, 1) === "#" && s.length > 1) {
        tok = new Tokens.Pragma(pos, s);
      } else if (s.length === 1 && (s === "." || s === ",")) {
        tok = new Tokens.Punctuation(pos, s);
      } else if (s.length === 1 && s === "[") {
        if (whiteBefore && whiteAfter) {
          tok = new Tokens.WBracketLeftW(pos, s);
        } else if (whiteBefore) {
          tok = new Tokens.WBracketLeft(pos, s);
        } else if (whiteAfter) {
          tok = new Tokens.BracketLeftW(pos, s);
        } else {
          tok = new Tokens.BracketLeft(pos, s);
        }
      } else if (s.length === 1 && s === "(") {
        if (whiteBefore && whiteAfter) {
          tok = new Tokens.WParenLeftW(pos, s);
        } else if (whiteBefore) {
          tok = new Tokens.WParenLeft(pos, s);
        } else if (whiteAfter) {
          tok = new Tokens.ParenLeftW(pos, s);
        } else {
          tok = new Tokens.ParenLeft(pos, s);
        }
      } else if (s.length === 1 && s === "]") {
        if (whiteBefore && whiteAfter) {
          tok = new Tokens.WBracketRightW(pos, s);
        } else if (whiteBefore) {
          tok = new Tokens.WBracketRight(pos, s);
        } else if (whiteAfter) {
          tok = new Tokens.BracketRightW(pos, s);
        } else {
          tok = new Tokens.BracketRight(pos, s);
        }
      } else if (s.length === 1 && s === ")") {
        if (whiteBefore && whiteAfter) {
          tok = new Tokens.WParenRightW(pos, s);
        } else if (whiteBefore) {
          tok = new Tokens.WParenRight(pos, s);
        } else if (whiteAfter) {
          tok = new Tokens.ParenRightW(pos, s);
        } else {
          tok = new Tokens.ParenRight(pos, s);
        }
      } else if (s.length === 1 && s === "-") {
        if (whiteBefore && whiteAfter) {
          tok = new Tokens.WDashW(pos, s);
        } else if (whiteBefore) {
          tok = new Tokens.WDash(pos, s);
        } else if (whiteAfter) {
          tok = new Tokens.DashW(pos, s);
        } else {
          tok = new Tokens.Dash(pos, s);
        }
      } else if (s.length === 1 && s === "+") {
        if (whiteBefore && whiteAfter) {
          tok = new Tokens.WPlusW(pos, s);
        } else if (whiteBefore) {
          tok = new Tokens.WPlus(pos, s);
        } else if (whiteAfter) {
          tok = new Tokens.PlusW(pos, s);
        } else {
          tok = new Tokens.Plus(pos, s);
        }
      } else if (s.length === 2 && (s === "->" || s === "=>")) {
        if (whiteBefore && whiteAfter) {
          tok = new Tokens.WArrowW(pos, s);
        } else if (whiteBefore) {
          tok = new Tokens.WArrow(pos, s);
        } else if (whiteAfter) {
          tok = new Tokens.ArrowW(pos, s);
        } else {
          tok = new Tokens.Arrow(pos, s);
        }
      } else {
        tok = new Tokens.Identifier(pos, s);
      }
      this.tokens.push(tok);
    }
    this.buffer.clear();
  }

  private static process(raw: string) {
    this.stream = new Stream(raw);
    this.buffer = new Buffer();

    while (true) {
      let current = this.stream.currentChar();
      this.buffer.add(current);
      let buf = this.buffer.get();
      let ahead = this.stream.nextChar();
      let aahead = this.stream.nextNextChar();
      let prev = this.stream.prevChar();

      if (ahead === "'" && this.m === Mode.Normal) {
// start string
        this.add();
        this.m = Mode.Str;
      } else if (ahead === "|" && this.m === Mode.Normal) {
// start template
        this.add();
        this.m = Mode.Template;
      } else if (ahead === "`" && this.m === Mode.Normal) {
// start ping
        this.add();
        this.m = Mode.Ping;
      } else if ((ahead === "\"" || (ahead === "*" && current === "\n"))
          && this.m === Mode.Normal) {
// start comment
        this.add();
        this.m = Mode.Comment;

      } else if (buf.length > 1 && current === "`" && this.m === Mode.Ping) {
// end of ping
        this.add();
        this.m = Mode.Normal;
      } else if (buf.length > 1 && current === "|" && prev !== "\\" && this.m === Mode.Template) {
// end of template
        this.add();
        this.m = Mode.Normal;
      } else if (this.m === Mode.Str
          && buf.length > 1
          && current === "'"
          && aahead !== "''"
          && (buf.match(/'/g) || []).length % 2 === 0
          && (buf.concat(ahead).match(/'/g) || []).length % 2 === 0) {
// end of string
        this.add();
        this.m = Mode.Normal;

      } else if ((ahead === " "
          || ahead === ":"
          || ahead === "."
          || ahead === ","
          || ahead === "-"
          || ahead === "+"
          || ahead === "("
          || ahead === ")"
          || ahead === "["
          || ahead === "]"
          || aahead === "->"
          || aahead === "=>"
          || ahead === "\t"
          || ahead === "\n")
          && this.m === Mode.Normal) {
        this.add();
      } else if (ahead === "\n" && this.m !== Mode.Template) {
        this.add();
        this.m = Mode.Normal;
      } else if (current === ">"
          && (prev === "-" || prev === "=" )
          && ahead !== " "
          && this.m === Mode.Normal) {
// arrows
        this.add();
      } else if ((buf === "."
          || buf === ","
          || buf === ":"
          || buf === "("
          || buf === ")"
          || buf === "["
          || buf === "]"
          || buf === "+"
          || ( buf === "-" && ahead !== ">" ) )
          && this.m === Mode.Normal) {
        this.add();
      }

      if (!this.stream.advance()) {
        break;
      }
    }

    this.add();
  }

}