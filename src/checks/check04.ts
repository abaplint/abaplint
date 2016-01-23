import { Check } from "./check";
import File from "../file";
import { Token } from "../tokens/";
import Issue from "../issue";
import * as Statements from "../statements/";

export class Check04 implements Check {

    public get_key(): string {
        return "04";
    }

    public get_description(): string {
        return "Max one statement per line";
    }

    public run(file: File) {
        let prev: number = 0;
        let reported: number = 0;
        for (let statement of file.get_statements()) {
            let term = statement.get_terminator();
            if (statement instanceof Statements.Comment || term === ",") {
                continue;
            }

            let pos = statement.get_start();
            let row = pos.get_row();
            if (prev === row && row !== reported) {
                let issue = new Issue(this, pos, file);
                file.add(issue);
                reported = row;
            }
            prev = row;
        }
    }

}