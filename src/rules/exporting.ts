import { Rule } from "./rule";
import File from "../file";
import Position from "../position";
import Issue from "../issue";

class Counter {
    public exporting: boolean = false;
    public other: boolean = false;
    public pos: Position;
}

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

    private last_char(s: string): string {
        return s.charAt(s.length - 1);
    }

    private first_char(s: string): string {
        return s.charAt(0);
    }

    public run(file: File) {
        let current = new Counter();
        let stack: Array<Counter> = [];

        for (let statement of file.get_statements()) {
            for (let token of statement.get_tokens()) {
                if (this.last_char(token.get_str()) === "(") {
                    stack.push(current);
                    current = new Counter();
                } else if (this.first_char(token.get_str()) === ")") {
                    if (current.exporting === true && current.other === false) {
                        let issue = new Issue(this, current.pos, file);
                        file.add(issue);
                    }
                    current = stack.pop();
                } else if (token.get_str() === "EXPORTING") {
                    current.exporting = true;
                    current.pos = token.get_pos();
                } else if (token.get_str() === "IMPORTING"
                        || token.get_str() === "RECEIVING"
                        || token.get_str() === "EXCEPTIONS"
                        || token.get_str() === "CHANGING") {
                    current.other = true;
                }
            }
        }
    }

}