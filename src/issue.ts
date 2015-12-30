import { Check } from "./checks/checks";
import File from "./file";
import { Token } from "./tokens/tokens";

export default class Issue {

    constructor(private check: Check,
                private token: Token,
                private file: File) {
    }

    public get_description(): string {
        return this.check.get_description();
    }

    public get_row(): number {
        return this.token.get_row();
    }

    public get_col(): number {
        return this.token.get_col();
    }

    public get_filename(): string {
        return this.file.get_filename();
    }
}