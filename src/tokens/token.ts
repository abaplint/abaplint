import Position from "../position";

export abstract class Token {
    private pos: Position;

    constructor(row: number, col: number, private str: string) {
        this.pos = new Position(row, col);
    }

    public get_str(): string {
        return this.str;
    }

    public set_str(str: string) {
        this.str = str;
    }

    public get_row(): number {
        return this.pos.get_row();
    }

    public get_col(): number {
        return this.pos.get_col();
    }

    public get_pos(): Position {
        return this.pos;
    }
}