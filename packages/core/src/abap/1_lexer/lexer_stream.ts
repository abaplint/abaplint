const NL = 10;   // "\n"
const EOF = -1;  // no character (start/end of file)

export class LexerStream {
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
    if (this.currentChar() === NL) {
      this.col = 1;
      this.row = this.row + 1;
    }

    if (this.offset === this.raw.length) {
      this.col = this.col - 1;
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

  // the *Char() accessors return character codes (charCodeAt) rather than
  // single character strings, to avoid allocating a string per input character
  // in the lexer hot loop. EOF (-1) is returned when the offset is out of range.

  public prevChar(): number {
    const o = this.offset - 1;
    if (o < 0) {
      return EOF;
    }
    return this.raw.charCodeAt(o);
  }

  public prevPrevChar(): number {
    const o = this.offset - 2;
    if (o < 0) {
      return EOF;
    }
    return this.raw.charCodeAt(o);
  }

  public currentChar(): number {
    if (this.offset < 0) {
      return NL; // simulate newline at start of file to handle star(*) comments
    } else if (this.offset >= this.raw.length) {
      return EOF;
    }
    return this.raw.charCodeAt(this.offset);
  }

  public nextChar(): number {
    const o = this.offset + 1;
    if (o >= this.raw.length) {
      return EOF;
    }
    return this.raw.charCodeAt(o);
  }

  public nextNextChar(): number {
    const o = this.offset + 2;
    if (o >= this.raw.length) {
      return EOF;
    }
    return this.raw.charCodeAt(o);
  }

  public charCodeAt(o: number): number {
    if (o < 0 || o >= this.raw.length) {
      return EOF;
    }
    return this.raw.charCodeAt(o);
  }

  public getRaw(): string {
    return this.raw;
  }

  public getOffset() {
    return this.offset;
  }
}
