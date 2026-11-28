import {Comment, Identifier} from "../abap/1_lexer/tokens";
import {AbstractToken} from "../abap/1_lexer/tokens/abstract_token";
import {IFile} from "../files/_ifile";
import {Position} from "../position";

// todo: Keywords must be all uppercase, all lowercase, or in lowercase with an
// uppercase initial letter. Other mixes of uppercase and lowercase are not allowed

class Stream {
  private buffer: string;

  public constructor(buffer: string) {
    this.buffer = buffer;
  }

  public takeNext(): string {
    const next = this.buffer.substring(0, 1);
    this.buffer = this.buffer.substring(1);
    return next;
  }

  public peekNext(): string {
    const next = this.buffer.substring(0, 1);
    return next;
  }

  public length(): number {
    return this.buffer.length;
  }
}

enum Mode {
  Default,
  String,
  DoubleQuoteString,
  SingleLineComment,
  MultiLineComment,
}

class Result {
  private readonly result: AbstractToken[] = [];

  /** row and col are the position of the first character of the text */
  public add(text: string, row: number, col: number, mode: Mode): string {
    if (text.length > 0) {
      if (mode === Mode.SingleLineComment
          && (text.startsWith("--") || text.startsWith("//"))) {
        this.result.push(new Comment(new Position(row, col), text));
      } else {
        this.result.push(new Identifier(new Position(row, col), text));
      }
    }
    return "";
  }

  public get() {
    return this.result;
  }
}

export class CDSLexer {
  public static run(file: IFile): AbstractToken[] {
    const result = new Result();
    let mode = Mode.Default;
    // position of the character "next", 1-based
    let row = 1;
    let col = 0;
    let build = "";
    // position of the first character in build
    let startRow = 1;
    let startCol = 1;
    const append = (text: string) => {
      if (build === "") {
        startRow = row;
        startCol = col;
      }
      build += text;
    };
    const flush = () => {
      build = result.add(build, startRow, startCol, mode);
    };

    const stream = new Stream(file.getRaw().replace(/\r/g, "").replace(/\u00a0/g, " ").replace(/\u000b/g, " "));

    let next = "";
    while (stream.length() > 0) {
      const prev = next;
      next = stream.takeNext();
      const nextNext = stream.peekNext();
      col++;

// string handling
      if (mode === Mode.String) {
        append(next);
        if (next === "\n") {
          row++;
          col = 0;
        } else if (next === "'" && nextNext === "'") {
          // escaped single quote (doubled), continue string
          build += stream.takeNext();
          col++;
        } else if (next === "\\" && nextNext === "\\") {
          // escaped backslash (e.g. '\\' in ltrim/rtrim calls), consume both chars
          build += stream.takeNext();
          col++;
        } else if (next === "\\" && nextNext === "'") {
          // backslash-escaped single quote, continue string
          build += stream.takeNext();
          col++;
        } else if (next === "'") {
          flush();
          mode = Mode.Default;
        }
        continue;
      }

// double-quote string handling
      if (mode === Mode.DoubleQuoteString) {
        append(next);
        if (next === "\n") {
          row++;
          col = 0;
        } else if (next === "\\" && nextNext === "\"") {
          build += stream.takeNext();
          col++;
        } else if (next === "\"" && nextNext === "\"") {
          build += stream.takeNext();
          col++;
        } else if (next === "\"") {
          flush();
          mode = Mode.Default;
        }
        continue;
      }

// single line comment handling
      if (mode === Mode.SingleLineComment) {
        if (next === "\n") {
          flush();
          mode = Mode.Default;
        } else {
          append(next);
          continue;
        }
      } else if (mode === Mode.Default && next === "/" && nextNext === "/") {
        mode = Mode.SingleLineComment;
        flush();
        append(next);
        continue;
      } else if (mode === Mode.Default && next === "-" && nextNext === "-") {
        mode = Mode.SingleLineComment;
        flush();
        append(next);
        continue;
      }

// multi line comment handling
      if (mode === Mode.MultiLineComment) {
        if (next === "\n") {
          row++;
          col = 0;
        } else if (prev === "*" && next === "/") {
          mode = Mode.Default;
        }
        continue;
      } else if (mode === Mode.Default && next === "/" && nextNext === "*") {
        mode = Mode.MultiLineComment;
        flush();
        stream.takeNext(); // consume the '*' so it doesn't become prev for '*/' detection
        col++;
        continue;
      }

      switch (next) {
        case "'":
          flush();
          mode = Mode.String;
          append(next);
          break;
        case "\"":
          flush();
          mode = Mode.DoubleQuoteString;
          append(next);
          break;
        case " ":
        case "\t":
          flush();
          break;
        case "\n":
          flush();
          row++;
          col = 0;
          break;
        case ";":
        case ":":
        case ",":
        case ".":
        case "{":
        case "}":
        case "(":
        case ")":
        case "[":
        case "]":
        case "!":
        case "=":
        case "<":
        case ">":
        case "+":
        case "-":
        case "*":
        case "/":
          flush();
          result.add(next, row, col, mode);
          break;
        case "@":
          // @ starts a new annotation; flush current token and start building with @
          flush();
          append(next);
          break;
        default:
          append(next);
          break;
      }
    }

    flush();
    return result.get();
  }
}
