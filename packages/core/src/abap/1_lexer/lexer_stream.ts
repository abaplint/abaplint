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
