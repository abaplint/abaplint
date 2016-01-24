import { Rule } from "./rule";
import File from "../file";
import Issue from "../issue";

export class Check02 implements Rule {

    public get_key(): string {
        return "02";
    }

    public get_description(): string {
        return "Use functional writing style";
    }

    private startsWith(string: string, value: string): boolean {
        return string.substr(0, value.length) === value;
    }

// todo, dynamic CALL METHODs

    public run(file: File) {
        for (let statement of file.get_statements()) {
            let code = statement.concat_tokens().toUpperCase();
            if(this.startsWith(code, "CALL METHOD ")) {
                let call = statement.get_tokens()[2].get_str();
                if (call.match("\\)[=-]>") != undefined) {
                    continue;
                }
                let issue = new Issue(this, statement.get_start(), file);
                file.add(issue);
            }
        }
    }

}