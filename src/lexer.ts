import * as Tokens from "./tokens/";
import File from "./file";
import Position from "./position";

enum Mode {
  Normal,
  Ping,
  Str,
  Template,
  Comment
}

class Stream {
  private raw: string;
  private offset = -1;

  public constructor(raw: string) {
    this.raw = raw;
  }

  public advance(): boolean {
    if (this.offset === this.raw.length) {
      return false;
    }
    this.offset = this.offset + 1;
    return true;
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

  public static run(file: File): Array<Tokens.Token> {
    this.tokens = [];
    this.m = Mode.Normal;

    this.process(file.getRaw());
// console.dir(this.tokens);
    return this.tokens;
  }

  private static add(input: string, row: number, col: number) {
    let s = input.trim();
    if (s.length > 0) {
// console.log("add " + col + " " + s);
      let pos = new Position(row, col - s.length);
      if (this.m === Mode.Comment) {
        this.tokens.push(new Tokens.Comment(pos, s));
      } else if (this.m === Mode.Ping || this.m === Mode.Str || this.m === Mode.Template) {
        this.tokens.push(new Tokens.String(pos, s));
      } else if (s.substr(0, 1) === "#") {
        this.tokens.push(new Tokens.Pragma(pos, s));
      } else if (s.length === 1 && (s === "." || s === ",")) {
        this.tokens.push(new Tokens.Punctuation(pos, s));
      } else if (s.length === 1 && s === "[") {
        this.tokens.push(new Tokens.BracketLeft(pos, s));
      } else if (s.length === 1 && s === "(") {
        this.tokens.push(new Tokens.ParenLeft(pos, s));
      } else if (s.length === 1 && s === "]") {
        this.tokens.push(new Tokens.BracketRight(pos, s));
      } else if (s.length === 1 && s === ")") {
        this.tokens.push(new Tokens.ParenRight(pos, s));
      } else if (s.length === 1 && s === "-") {
        this.tokens.push(new Tokens.Dash(pos, s));
      } else if (s.length === 1 && s === "+") {
        this.tokens.push(new Tokens.Plus(pos, s));
      } else if (s.length === 2 && (s === "->" || s === "=>")) {
        this.tokens.push(new Tokens.Arrow(pos, s));
      } else {
        this.tokens.push(new Tokens.Identifier(pos, s));
      }
    }
  }

  private static process(raw: string) {
    let buffer = "";
    let row = 0;
    let col = 0;

    this.stream = new Stream(raw);

    while (true) {
      let current = this.stream.currentChar();
      buffer = buffer + current;
      let ahead = this.stream.nextChar();
      let aahead = this.stream.nextNextChar();
      let prev = this.stream.prevChar();

// console.log("\"" + current.trim() + "\"\t\"" + ahead.trim() + "\"\t" + col);

      if (ahead === "'" && this.m === Mode.Normal) {
// start string
        this.add(buffer, row, col);
        buffer = "";
        this.m = Mode.Str;
      } else if (ahead === "|" && this.m === Mode.Normal) {
// start template
        this.add(buffer, row, col);
        buffer = "";
        this.m = Mode.Template;
      } else if (ahead === "`" && this.m === Mode.Normal) {
// start ping
        this.add(buffer, row, col);
        buffer = "";
        this.m = Mode.Ping;
      } else if ((ahead === "\"" || (ahead === "*" && current === "\n"))
          && this.m === Mode.Normal) {
// start comment
        this.add(buffer, row, col);
        buffer = "";
        this.m = Mode.Comment;

      } else if (buffer.length > 1 && current === "`" && this.m === Mode.Ping) {
// end of ping
        this.add(buffer, row, col);
        buffer = "";
        this.m = Mode.Normal;
      } else if (buffer.length > 1 && current === "|" && this.m === Mode.Template) {
// end of template
        this.add(buffer, row, col);
        buffer = "";
        this.m = Mode.Normal;
      } else if (this.m === Mode.Str
          && buffer.length > 1
          && current === "'"
          && aahead !== "''"
          && (buffer.match(/'/g) || []).length % 2 === 0
          && (buffer.concat(aahead).match(/'/g) || []).length % 2 === 0) {
// end of string
        this.add(buffer, row, col);
        buffer = "";
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
        this.add(buffer, row, col);
        buffer = "";
      } else if (ahead === "\n" && this.m !== Mode.Template) {
        this.add(buffer, row, col);
        buffer = "";
        this.m = Mode.Normal;
      } else if (current === ">"
          && (prev === "-" || prev === "=" )
          && ahead !== " "
          && this.m === Mode.Normal) {
// arrows
        this.add(buffer, row, col);
        buffer = "";
      } else if ((buffer === "."
          || buffer === ","
          || buffer === ":"
          || buffer === "("
          || buffer === ")"
          || buffer === "["
          || buffer === "]"
          || buffer === "+"
          || ( buffer === "-" && ahead !== ">" ) )
          && this.m === Mode.Normal) {
        this.add(buffer, row, col);
        buffer = "";
      }

      if (current === "\n") {
        col = 1;
        row = row + 1;
      }

      if (!this.stream.advance()) {
        break;
      }

      col = col + 1;
    }

    this.add(buffer, row, col - 1);
  }

}