import { Check } from "./check";
import File from "../file";
import Report from "../report";
import Issue from "../issue";
import Position from "../position";
import * as Statements from "../statements/statements";

export class Check11 implements Check {

    constructor(private report: Report) { }

    public get_key(): string {
        return "11";
    }

    public get_description(): string {
        return "Contains non 7 bit ascii character";
    }

    public run(file: File) {
        let rows = file.get_raw_rows();

        for (let i = 0; i < rows.length; i++) {
            if (/^[\u0000-\u007f]*$/.test(rows[i])) {
                let issue = new Issue(this, new Position(i + 1, 1), file);
                this.report.add(issue);
            }
        }
    }
}