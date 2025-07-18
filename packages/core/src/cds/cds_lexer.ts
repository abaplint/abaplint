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
  SingleLineComment,
  MultiLineComment,
}

class Result {
  private readonly result: AbstractToken[] = [];

  public add(text: string, row: number, col: number, mode: Mode): string {
    if (text.length > 0) {
      if (mode === Mode.SingleLineComment) {
        this.result.push(new Comment(new Position(row, col - text.length), text));
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
    let row = 1;
    let col = 1;
    let build = "";

    const stream = new Stream(file.getRaw().replace(/\r/g, "").replace(/\u00a0/g, " "));

    let next = "";
    while (stream.length() > 0) {
      const prev = next;
      next = stream.takeNext();
      const nextNext = stream.peekNext();
      col++;

// string handling
      if (mode === Mode.String) {
        build += next;
        if (next === "'") {
          build = result.add(build, row, col, mode);
          mode = Mode.Default;
        }
        continue;
      }

// single line comment handling
      if (mode === Mode.SingleLineComment) {
        if (next === "\n") {
          build = result.add(build, row, col, mode);
          mode = Mode.Default;
        } else {
          build += next;
          continue;
        }
      } else if (mode === Mode.Default && next === "/" && nextNext === "/") {
        mode = Mode.SingleLineComment;
        build = result.add(build, row, col, mode);
        build += next;
        continue;
      } else if (mode === Mode.Default && next === "-" && nextNext === "-") {
        mode = Mode.SingleLineComment;
        build = result.add(build, row, col, mode);
        build += next;
        continue;
      }

// multi line comment handling
      if (mode === Mode.MultiLineComment) {
        if (next === "\n") {
          row++;
        } else if (prev === "*" && next === "/") {
          mode = Mode.Default;
        }
        continue;
      } else if (mode === Mode.Default && next === "/" && nextNext === "*") {
        mode = Mode.MultiLineComment;
        build = result.add(build, row, col, mode);
        continue;
      }

      switch (next) {
        case "'":
          mode = Mode.String;
          build += next;
          break;
        case " ":
          build = result.add(build, row, col, mode);
          break;
        case "\n":
          build = result.add(build, row, col, mode);
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
        case "=":
        case "<":
        case ">":
        case "+":
        case "-":
        case "*":
        case "/":
          build = result.add(build, row, col, mode);
          result.add(next, row, col, mode);
          break;
        default:
          build += next;
          break;
      }
    }

    result.add(build, row, col, mode);
    return result.get();
  }
}