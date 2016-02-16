import { Rule } from "./rule";
import File from "../file";
import Issue from "../issue";

export class Check02 implements Rule {

    public get_key(): string {
        return "functional_writing";
    }

    public get_description(): string {
        return "Use functional writing style";
    }

    public default_config() {
        return {
			"enabled": true
		};
    }

    private startsWith(string: string, value: string): boolean {
        return string.substr(0, value.length) === value;
    }

    public run(file: File) {
        for (let statement of file.get_statements()) {
            let code = statement.concat_tokens().toUpperCase();
            if(this.startsWith(code, "CALL METHOD ")) {
                if (/\)[=-]>/.test(code) === true
                        || /[=-]>\(/.test(code) === true) {
                    continue;
                }
                let issue = new Issue(this, statement.get_start(), file);
                file.add(issue);
            }
        }
    }

}