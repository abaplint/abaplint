import { Check } from "./check";
import File from "../file";
import Report from "../report";
import { Token } from "../tokens/tokens";
import Issue from "../issue";

export class Check03 implements Check {

    constructor(private report: Report) { }

    public get_key(): string {
        return "03";
    }

    public get_description(): string {
        return "Line contains only . or ).";
    }

    public run(file: File) {
        for (let statement of file.get_statements()) {
            let line = "";
            let token: Token;
            let prev: number;
            for (token of statement.get_tokens()) {
                if (prev != token.get_row()) {
                    line = "";
                }
                line = line + token.get_str();
                prev = token.get_row();
            }
            if (line === "." || line === ").") {
                let issue = new Issue(this, token, file);
                this.report.add(issue);
            }
        }
    }

}