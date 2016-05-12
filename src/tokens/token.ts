import Position from "../position";

export abstract class Token {
  private pos: Position;
  private str: string;

  constructor(pos: Position, str: string) {
    this.pos = pos;
    this.str = str;
  }

  public get_str(): string {
    return this.str;
  }

  public get_row(): number {
    return this.pos.getRow();
  }

  public get_col(): number {
    return this.pos.getCol();
  }

  public get_pos(): Position {
    return this.pos;
  }
}