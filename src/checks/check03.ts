import { Check } from "./check";
import Parser from "../parser";
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

    public run(filename: string, parser: Parser) {
        for (let statement of parser.get_statements()) {
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
                let issue = new Issue(this, token.get_row(), token.get_col(), filename);
                this.report.add(issue);
            }
        }
    }

}