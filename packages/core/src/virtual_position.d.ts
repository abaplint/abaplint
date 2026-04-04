import { Position } from "./position";
/** used for macro calls */
export declare class VirtualPosition extends Position {
    readonly vrow: number;
    readonly vcol: number;
    constructor(virtual: Position, row: number, col: number);
    equals(p: Position): boolean;
    isAfter(p: Position | VirtualPosition): boolean;
}
