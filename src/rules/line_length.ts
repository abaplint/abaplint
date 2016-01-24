import { Rule } from "./rule";
import File from "../file";
import Issue from "../issue";
import Position from "../position";

export class Check05 implements Rule {

    public get_key(): string {
        return "line_length";
    }

    public get_description(): string {
        return "Reduce line length";
    }

    public run(file: File) {
        let lines = file.get_raw().split("\n");
        for (let line = 0; line < lines.length; line++) {
            if (lines[line].length > 120) {
                let issue = new Issue(this, new Position(line + 1, 1), file);
                file.add(issue);
            }
        }
    }

}