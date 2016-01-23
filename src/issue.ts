import { Check } from "./checks/";
import File from "./file";
import Position from "./position";

export default class Issue {

    constructor(private check: Check,
                private position: Position,
                private file: File) {
    }

    public get_description(): string {
        return this.check.get_description();
    }

    public get_row(): number {
        return this.position.get_row();
    }

    public get_col(): number {
        return this.position.get_col();
    }

    public get_filename(): string {
        return this.file.get_filename();
    }
}