import {Position} from "../../../position";

export abstract class Token {
  private readonly pos: Position;
  private readonly str: string;

  public constructor(pos: Position, str: string) {
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

  public getStart(): Position {
    return this.pos;
  }

  public getEnd(): Position {
    return new Position(this.pos.getRow(), this.pos.getCol() + this.str.length);
  }
}