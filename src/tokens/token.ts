export abstract class Token {

    constructor(private row: number, private col: number, private str: string) {
    }

    public get_str(): string {
        return this.str;
    }

    public set_str(str: string) {
        this.str = str;
    }

    public get_row(): number {
        return this.row;
    }

    public get_col(): number {
        return this.col;
    }
}