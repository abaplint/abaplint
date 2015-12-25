import Statement from "./statement";
import Check from "./check";
import Report from "./report";

export default class Check01 implements Check {

    constructor(private report: Report) {

    }

    public get_key(): string {
        return "01";
    }

    public get_description(): string {
        return "Start statement at tab position";
    }

    public run(statements: Array<Statement>) {
        for (let statement of statements) {
            if (statement.get_tokens()[0].get_col() % 2 !== 0) {
                this.report.add(this.get_description());
            }
        }
    }

}