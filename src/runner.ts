/// <reference path="../typings/node/node.d.ts" />

import Report from "./report";
import File from "./file";
import * as Checks from "./checks/checks";
import * as fs from "fs";

export default class Runner {
    private report: Report;

    constructor(filename: string, report?: Report) {
        if (report) {
            this.report = report;
        } else {
            this.report = new Report();
        }
        this.analyze(filename);
    }

    public get_report(): Report {
        return this.report;
    }

    private analyze(filename: string) {
        let code = fs.readFileSync(filename, "utf8");

        let file = new File(filename, code);

        let check01 = new Checks.Check01(this.report);
        check01.run(file);

        let check02 = new Checks.Check02(this.report);
        check02.run(file);

        let check03 = new Checks.Check03(this.report);
        check03.run(file);
    }
}