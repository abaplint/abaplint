// largest value that is a Smi on all V8 builds, larger values (eg. Number.MAX_SAFE_INTEGER) make V8
// store row/col of every Position as boxed heap numbers, costing ~32 bytes per Position
export const MAX_POSITION_VALUE = 2 ** 30 - 1;

// first position is (1,1)
export class Position {
  private readonly row: number;
  private readonly col: number;

  public constructor(row: number, col: number) {
    this.row = row;
    this.col = col;
  }

  public getCol(): number {
    return this.col;
  }

  public getRow(): number {
    return this.row;
  }

  public isAfter(p: Position): boolean {
    return this.row > p.row || (this.row === p.row && this.col >= p.col);
  }

  public equals(p: Position): boolean {
    return this.row === p.getRow() && this.col === p.getCol();
  }

  public isBefore(p: Position): boolean {
    return this.row < p.row || (this.row === p.row && this.col < p.col);
  }

  public isBetween(p1: Position, p2: Position): boolean {
    return this.isAfter(p1) && this.isBefore(p2);
  }
}

