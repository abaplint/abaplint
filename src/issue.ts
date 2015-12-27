import { Check } from "./checks/checks";
import File from "./file";

export default class Issue {

    constructor(private check: Check,
                private row: number,
                private col: number,
                private file: File) {
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
        return this.file.get_filename();
    }
}