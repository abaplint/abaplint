import Check from "./check";

export default class Issue {

    constructor(private check: Check,
                private row: number,
                private col: number,
                private filename: string) {
    }

    public get_description(): string {
        return this.check.get_description();
    }

    public get_row(): number {
        return this.row;
    }

    public get_col(): number {
        return this.col;
    }

    public get_filename(): string {
        return this.filename;
    }
}