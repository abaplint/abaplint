// The buffer holds a reference to the raw input and tracks the [start, end)
// offset range of the current token, so the token string can be sliced out with
// a single substring() instead of being concatenated one character at a time.
export class LexerBuffer {
  private readonly raw: string;
  private start: number;
  private end: number;   // exclusive
  private empty: boolean;

  public constructor(raw: string) {
    this.raw = raw;
    this.start = 0;
    this.end = 0;
    this.empty = true;
  }

  public add(offset: number): void {
    if (this.empty === true) {
      this.start = offset < 0 ? 0 : offset;
      this.empty = false;
    }
    this.end = offset + 1;
  }

  public get(): string {
    return this.raw.substring(this.start, this.end);
  }

  public length(): number {
    return this.end - this.start;
  }

  public clear(): void {
    this.start = 0;
    this.end = 0;
    this.empty = true;
  }

  public countIsEven(char: number): boolean {
    let count = 0;
    for (let i = this.start; i < this.end; i += 1) {
      if (this.raw.charCodeAt(i) === char) {
        count += 1;
      }
    }
    return count % 2 === 0;
  }
}
