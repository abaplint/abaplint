import Position from "../position";

export abstract class Token {
  private pos: Position;
  private str: string;

  constructor(pos: Position, str: string) {
    this.pos = pos;
    this.str = str;
  }

  public getStr(): string {
    return this.str;
  }

  public getRow(): number {
    return this.pos.getRow();
  }

  public getCol(): number {
    return this.pos.getCol();
  }

  public getPos(): Position {
    return this.pos;
  }
}