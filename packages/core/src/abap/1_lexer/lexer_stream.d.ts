export declare class LexerStream {
    private readonly raw;
    private offset;
    private row;
    private col;
    constructor(raw: string);
    advance(): boolean;
    getCol(): number;
    getRow(): number;
    prevChar(): string;
    prevPrevChar(): string;
    currentChar(): string;
    nextChar(): string;
    nextNextChar(): string;
    getRaw(): string;
    getOffset(): number;
}
