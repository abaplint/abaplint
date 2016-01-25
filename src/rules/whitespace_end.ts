import { Rule } from "./rule";
import File from "../file";
import Issue from "../issue";
import Position from "../position";
import * as Statements from "../statements/";

export class WhitespaceEnd implements Rule {

    public get_key(): string {
        return "whitespace_end";
    }

    public get_description(): string {
        return "Whitespace at end of line";
    }

    public default_config() {
        return {
			"enabled": true
		};
    }

    public run(file: File) {
        let rows = file.get_raw_rows();

        for (let i = 0; i < rows.length; i++) {
            if (/.* $/.test(rows[i]) === true) {
                let issue = new Issue(this, new Position(i + 1, 1), file);
                file.add(issue);
            }
        }
    }
}