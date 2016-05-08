export default class Position {

    private row: number;
    private col: number;

    constructor(row: number, col: number) {
        this.row = row;
        this.col = col;
    }

    public get_col(): number {
        return this.col;
    }

    public get_row(): number {
        return this.row;
    }
}