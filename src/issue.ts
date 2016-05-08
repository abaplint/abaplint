import { Rule } from "./rules/";
import File from "./file";
import Position from "./position";

export default class Issue {

    private rule: Rule;
    private position: Position;
    private file: File;

    constructor(rule: Rule, position: Position, file: File) {
        this.rule = rule;
        this.position = position;
        this.file = file;
    }

    public get_description(): string {
        return this.rule.get_description();
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