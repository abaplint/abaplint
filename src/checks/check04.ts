import { Check } from "./check";
import File from "../file";
import Report from "../report";
import { Token } from "../tokens/tokens";
import Issue from "../issue";
import * as Statements from "../statements/statements";

export class Check04 implements Check {

    constructor(private report: Report) { }

    public get_key(): string {
        return "04";
    }

    public get_description(): string {
        return "Max one statement per line";
    }

    public run(file: File) {
        let prev: number = 0;
        for (let statement of file.get_statements()) {
            let term = statement.get_terminator();
            if (statement instanceof Statements.Comment || term === ",") {
                continue;
            }

            let token = statement.get_tokens()[0];
            let row = token.get_row();
            if (prev === row) {
                let issue = new Issue(this, token.get_pos(), file);
                this.report.add(issue);
            }
            prev = row;
        }
    }

}