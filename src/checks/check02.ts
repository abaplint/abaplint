import { Check } from "./check";
import File from "../file";
import Report from "../report";
import Issue from "../issue";

export class Check02 implements Check {

    constructor(private report: Report) { }

    public get_key(): string {
        return "02";
    }

    public get_description(): string {
        return "Use functional writing style";
    }

    private startsWith(string: string, value: string): boolean {
        return string.substr(0, value.length) === value;
    }

    public run(file: File) {
        for (let statement of file.get_statements()) {
            let code = statement.concat_tokens().toUpperCase();
            if(this.startsWith(code, "CALL METHOD ")) {
                let token = statement.get_tokens()[0];
                let issue = new Issue(this, token.get_row(), token.get_col(), file);
                this.report.add(issue);
            }
        }
    }

}