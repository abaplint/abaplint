import { Check } from "./check";
import File from "../file";
import Report from "../report";
import { Token } from "../tokens/tokens";
import Issue from "../issue";
import Position from "../position";

export class Check03 implements Check {

    constructor(private report: Report) { }

    public get_key(): string {
        return "03";
    }

    public get_description(): string {
        return "Line contains only . or ).";
    }

    public run(file: File) {
        let rows = file.get_raw_rows();
        for (let i = 0; i < rows.length; i++) {
            let trim = rows[i].trim();
            if (trim === "." || trim === ").") {
                let issue = new Issue(this, new Position(i + 1, 0), file);
                this.report.add(issue);
            }
        }
    }

}