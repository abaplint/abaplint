import { Check } from "./check";
import File from "../file";
import Report from "../report";
import Issue from "../issue";

export class Check07 implements Check {

    constructor(private report: Report) { }

    public get_key(): string {
        return "07";
    }

    public get_description(): string {
        return "Space before colon";
    }

    public run(file: File) {
        let prev = file.get_tokens[0];
        for (let token of file.get_tokens()) {
            if (token.get_str() === ":"
                    && prev.get_row() == token.get_row()
                    && prev.get_col() + prev.get_str().length < token.get_col()) {
                let issue = new Issue(this, token.get_pos(), file);
                this.report.add(issue);
            }
            prev = token;
        }
    }

}