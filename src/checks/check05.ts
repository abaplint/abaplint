import { Check } from "./check";
import File from "../file";
import Report from "../report";
import Issue from "../issue";
import Position from "../position";

export class Check05 implements Check {

    constructor(private report: Report) { }

    public get_key(): string {
        return "05";
    }

    public get_description(): string {
        return "Reduce line length";
    }

    public run(file: File) {
        let lines = file.get_raw().split("\n");
        for (let line = 0; line < lines.length; line++) {
            if (lines[line].length > 100) {
                let issue = new Issue(this, new Position(line + 1, 1), file);
                this.report.add(issue);
            }
        }
    }

}