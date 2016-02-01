import { Rule } from "./rule";
import File from "../file";
import Issue from "../issue";

export class Exporting implements Rule {

    public get_key(): string {
        return "exporting";
    }

    public get_description(): string {
        return "EXPORTING can be omitted";
    }

    public default_config() {
        return {
			"enabled": true
		};
    }

    public run(file: File) {
        for (let statement of file.get_statements()) {
//            let issue = new Issue(this, statement.get_start(), file);
//            file.add(issue);
        }
    }

}