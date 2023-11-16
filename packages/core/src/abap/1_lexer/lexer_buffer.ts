export class LexerBuffer {
  private buf: string;

  public constructor() {
    this.buf = "";
  }

  public add(s: string): string {
    this.buf = this.buf + s;
    return this.buf;
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
