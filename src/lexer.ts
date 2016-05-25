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

export default class Lexer {
  private static tokens: Array<Tokens.Token>;
  private static m: Mode;

  public static run(file: File): Array<Tokens.Token> {
    this.tokens = [];
    this.m = Mode.Normal;

    this.process(file.getRaw());
// console.dir(this.tokens);
    return this.tokens;
  }

  private static add(s: string, row: number, col: number) {
    if (s.length > 0) {
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
      } else if (s.length === 2 && (s === "->" || s === "=>")) {
        this.tokens.push(new Tokens.Arrow(pos, s));
      } else {
        this.tokens.push(new Tokens.Identifier(pos, s));
      }
    }
  }

  private static process(raw: string) {
    let before = "";

    let row = 1;
    let col = 1;

    while (raw.length > 0) {
      let char = raw.substr(0, 1);
      let ahead = raw.substr(1, 1);
      let bchar = before.substr(before.length - 1, 1);

      if ((char === " " || char === "\t") && this.m === Mode.Normal) {
        this.add(before, row, col);
        before = "";
      } else if ( (char === "." || char === "," || char === ":" || char === "]" || char === ")" )
          && this.m === Mode.Normal) {
        this.add(before, row, col);
        this.add(char, row, col + 1);
        before = "";
      } else if ( (char === "[" || char === "(") && before.length > 0 && this.m === Mode.Normal) {
        this.add(before, row, col);
        this.add(char, row, col + 1);
        before = "";
      } else if ( char === "-" && before.length > 0 && ahead !== ">" && ahead !== " " && this.m === Mode.Normal) {
        this.add(before, row, col);
        this.add(char, row, col + 1);
        before = "";
      } else if ( char === ">" && (bchar === "-" || bchar === "=" ) && ahead !== " " && this.m === Mode.Normal) {
        this.add(before.substr(0, before.length - 1), row, col - 1);
        this.add(bchar + char, row, col + 1);
        before = "";
      } else if (char === "\n") {
        this.add(before, row, col);
        before = "";
        row = row + 1;
        col = 0;
        if (this.m !== Mode.Template) {
          this.m = Mode.Normal;
        }
      } else if (char === "'" && this.m === Mode.Normal) {
        this.m = Mode.Str;
        this.add(before, row, col);
        before = char;
      } else if (char === "`" && this.m === Mode.Normal) {
        this.m = Mode.Ping;
        this.add(before, row, col);
        before = char;
      } else if (char === "|" && this.m === Mode.Normal) {
        this.m = Mode.Template;
        before = before + char;
      } else if (char === "\"" && this.m === Mode.Normal) {
        this.m = Mode.Comment;
        before = before + char;
      } else if (char === "*" && col === 1 && this.m === Mode.Normal) {
        this.m = Mode.Comment;
        before = before + char;
      } else if (char === "'" && ahead === "'" && this.m === Mode.Str) {
        before = before + char + ahead;
        col = col + 1;
        raw = raw.substr(1);
      } else if ((char === "'" && this.m === Mode.Str)
          || (char === "`" && this.m === Mode.Ping)
          || (char === "|" && this.m === Mode.Template)) {
        before = before + char;
        this.add(before, row, col + 1);
        before = "";
        this.m = Mode.Normal;
      } else {
        before = before + char;
      }

      col = col + 1;
      raw = raw.substr(1);
    }
    this.add(before, row, col);
  }

}