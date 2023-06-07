

class Token {
  private readonly col: number;
  private readonly row: number;
  private readonly type: number;
  private readonly str: string;

  public constructor(col: number, row: number, type: number, str: string) {
    this.col = col;
    this.row = row;
    this.type = type;
    this.str = str;
  }

  public get() {
    return {a: this.col, b: this.row, c: this.type, d: this.str};
  }
}

class TokensMemory {
  private readonly strings: string[] = [];
  private readonly memory = new Int32Array();
  private length = 0;

  public add(col: number, row: number, type: number, str: string) {
    this.memory[0 + this.length] = col;
    this.memory[1 + this.length] = row;
    this.memory[2 + this.length] = type;
    this.memory[3 + this.length] = this.strings.length;
    this.strings.push(str);
    this.length++;
  }
}

const count = 5000000;

{
  const start = Date.now();
  const mem = new TokensMemory();
  for (let i = 0; i < count; i++) {
    mem.add(i, i, i, "dfs" + i);
  }
  const runtime = Date.now() - start;
  console.log("Typed Array: " + runtime + "ms");
}

{
  const start = Date.now();
  const tokens = [];
  for (let i = 0; i < count; i++) {
    tokens.push(new Token(i, i, i, "dfs" + i));
  }
  const runtime = Date.now() - start;
  console.log("Objects: " + runtime + "ms");
}


