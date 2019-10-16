export class Position {
  private readonly row: number;
  private readonly col: number;

  constructor(row: number, col: number) {
    this.row = row;
    this.col = col;
  }

  public getCol(): number {
    return this.col;
  }

  public getRow(): number {
    return this.row;
  }
}