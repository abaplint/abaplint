import {Position} from "./position";

/** used for macro calls */

export class VirtualPosition extends Position {
  public readonly vrow: number;
  public readonly vcol: number;

  public constructor(virtual: Position, row: number, col: number) {
    super(virtual.getRow(), virtual.getCol());
    this.vrow = row;
    this.vcol = col;
  }

  public equals(p: Position): boolean {
    if (!(p instanceof VirtualPosition)) {
      return false;
    }
    const casted: VirtualPosition = p as VirtualPosition;
    return super.equals(this) && this.vrow === casted.vrow && this.vcol === casted.vcol;
  }
}
