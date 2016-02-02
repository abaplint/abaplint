import { Rule } from "./rule";
import File from "../file";
import Issue from "../issue";
import * as Statements from "../statements/";

export class EmptyStatement implements Rule {

    public get_key(): string {
        return "empty_statement";
    }

    public get_description(): string {
        return "Empty statement";
    }

    public default_config() {
        return {
			"enabled": true
		};
    }

    public run(file: File) {
        let statements = file.get_statements();

        for (let sta of statements) {
            if (sta instanceof Statements.Empty) {
                let issue = new Issue(this, sta.get_start(), file);
                file.add(issue);
            }
        }
    }
}