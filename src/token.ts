export default class Token {

    constructor(private row: number, private col: number, private str: string) {
    }

    get_str(): string {
        return this.str;
    }

    set_str(str: string) {
        this.str = str;
    }

    get_row(): number {
        return this.row;
    }

    get_col(): number {
        return this.col;
    }
}