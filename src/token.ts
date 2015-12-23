export default class Token {
    private row: number;
    private column: number;
    private str: string;

    constructor(row: number, column: number, str: string) {
        this.row = row;
        this.column = column;
        this.str = str;
    }
}