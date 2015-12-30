export default class Position {

    constructor(private row: number, private col: number) { }

    public get_col(): number {
        return this.col;
    }

    public get_row(): number {
        return this.row;
    }
}