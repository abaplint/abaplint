import {Position} from "../../../position";
import {VirtualPosition} from "../../../virtual_position";

// the token is its own start position, saves a separate Position object per token
export abstract class AbstractToken extends Position {
  private readonly str: string;
  private readonly strUpper: string;
  // only assigned for tokens from macro expansion, so other tokens don't pay for the field
  private readonly virtual?: VirtualPosition;

  public constructor(start: Position, str: string) {
    super(start.getRow(), start.getCol());
    this.str = str;
    this.strUpper = str.toUpperCase();
    if (start instanceof VirtualPosition) {
      this.virtual = start;
    }
  }

  // special function, for debugging purposes, see https://github.com/abaplint/abaplint/pull/3137
  public [Symbol.for("debug.description")](){
    return `${this.constructor.name} ${this.str}`;
  }

  public getStr(): string {
    return this.str;
  }

  public getUpperStr(): string {
    return this.strUpper;
  }

  public getStart(): Position {
    return this.virtual ?? this;
  }

  public getEnd(): Position {
    return new Position(this.getRow(), this.getCol() + this.str.length);
  }
}
