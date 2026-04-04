import { Position } from "../../../position";
export declare abstract class AbstractToken {
    private readonly start;
    private readonly str;
    constructor(start: Position, str: string);
    getStr(): string;
    getRow(): number;
    getCol(): number;
    getStart(): Position;
    getEnd(): Position;
}
