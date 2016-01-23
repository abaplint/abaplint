import { Check } from "./check";
import File from "../file";
import Report from "../report";
import Issue from "../issue";
import * as Statements from "../statements/";

export class Check06 implements Check {

    constructor(private report: Report) { }

    public get_key(): string {
        return "06";
    }

    public get_description(): string {
        return "EXIT or CHECK outside of loop";
    }

    public run(file: File) {
        let stack: Array<Statements.Statement> = [];

        for (let statement of file.get_statements()) {
            if (statement instanceof Statements.Loop
                    || statement instanceof Statements.While
                    || statement instanceof Statements.Do) {
                stack.push(statement);
            } else if (statement instanceof Statements.Endloop
                    || statement instanceof Statements.Endwhile
                    || statement instanceof Statements.Enddo) {
                stack.pop();
            } else if ((statement instanceof Statements.Check
                    || statement instanceof Statements.Exit)
                    && stack.length === 0) {
                let issue = new Issue(this, statement.get_start(), file);
                this.report.add(issue);
            }
        }
    }

}