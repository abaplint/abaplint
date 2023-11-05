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

