import { Rule } from "./rule";
import File from "../file";
import Issue from "../issue";
import Position from "../position";

export class Check08 implements Rule {

    public get_key(): string {
        return "08";
    }

    public get_description(): string {
        return "Code contains tab";
    }

    public run(file: File) {
        let lines = file.get_raw().split("\n");
        for (let line = 0; line < lines.length; line++) {
            if (/\t/.test(lines[line])) {
                let issue = new Issue(this, new Position(line + 1, 1), file);
                file.add(issue);
            }
        }
    }

}