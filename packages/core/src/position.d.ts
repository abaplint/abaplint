export declare class Position {
    private readonly row;
    private readonly col;
    constructor(row: number, col: number);
    getCol(): number;
    getRow(): number;
    isAfter(p: Position): boolean;
    equals(p: Position): boolean;
    isBefore(p: Position): boolean;
    isBetween(p1: Position, p2: Position): boolean;
}
