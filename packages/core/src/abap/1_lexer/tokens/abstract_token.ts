import {Position} from "../../../position";

export abstract class AbstractToken {
  private readonly start: Position;
  private readonly str: string;

  public constructor(start: Position, str: string) {
    this.start = start;
    this.str = str;
  }

  // special function, for debugging purposes, see https://github.com/abaplint/abaplint/pull/3137
  public [Symbol.for("debug.description")](){
    return `${this.constructor.name} ${this.str}`;
  }

  public getStr(): string {
    return this.str;
  }

  public getRow(): number {
    return this.start.getRow();
  }

  public getCol(): number {
    return this.start.getCol();
  }

  public getStart(): Position {
    return this.start;
  }

  public getEnd(): Position {
    return new Position(this.start.getRow(), this.start.getCol() + this.str.length);
  }
}