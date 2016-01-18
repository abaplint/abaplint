import { Check } from "./check";
import File from "../file";
import Report from "../report";
import Issue from "../issue";
import Position from "../position";
import * as Statements from "../statements/statements";

export class Check10 implements Check {

    constructor(private report: Report) { }

    public get_key(): string {
        return "10";
    }

    public get_description(): string {
        return "Missing space after colon";
    }

    public run(file: File) {
        let tokens = file.get_tokens();

        for (let i = 0; i < tokens.length; i++) {
            let token = tokens[i];
            if (token.get_str() === ":"
                    && tokens[i+1] !== undefined
                    && tokens[i+1].get_row() === token.get_row()
                    && tokens[i+1].get_col() === token.get_col() + 1) {
                let issue = new Issue(this, token.get_pos(), file);
                this.report.add(issue);
            }
        }
    }
}