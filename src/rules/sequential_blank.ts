import { Rule } from "./rule";
import File from "../file";
import Issue from "../issue";
import Position from "../position";
import * as Statements from "../statements/";

export class SequentialBlank implements Rule {

    public get_key(): string {
        return "sequential_blank";
    }

    public get_description(): string {
        return "Sequential blank lines";
    }

    public default_config() {
        return {
			"enabled": true,
            "lines": 4
		};
    }

    public run(file: File) {
        let rows = file.get_raw_rows();
        let blanks = 0;

        for (let i = 0; i < rows.length; i++) {
            if (rows[i] === "") {
                blanks++;
            } else {
                blanks = 0;
            }

            if (blanks === 4) { // todo, configuration
                let issue = new Issue(this, new Position(i + 1, 1), file);
                file.add(issue);
            }
        }
    }
}