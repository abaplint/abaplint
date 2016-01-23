import Report from "./report";
import File from "./file";
import * as Checks from "./checks/checks";

export default class Runner {
    private report: Report;

    constructor(file: File, report?: Report) {
        if (report) {
            this.report = report;
        } else {
            this.report = new Report();
        }
        this.analyze(file);
    }

    public get_report(): Report {
        return this.report;
    }

    private analyze(file: File) {

// TODO, some easier way to call all the checks

        let check01 = new Checks.Check01(this.report);
        check01.run(file);

        let check02 = new Checks.Check02(this.report);
        check02.run(file);

        let check03 = new Checks.Check03(this.report);
        check03.run(file);

        let check04 = new Checks.Check04(this.report);
        check04.run(file);

        let check05 = new Checks.Check05(this.report);
        check05.run(file);

        let check06 = new Checks.Check06(this.report);
        check06.run(file);

        let check07 = new Checks.Check07(this.report);
        check07.run(file);

        let check08 = new Checks.Check08(this.report);
        check08.run(file);

        let check09 = new Checks.Check09(this.report);
        check09.run(file);

        let check10 = new Checks.Check10(this.report);
        check10.run(file);

        let check11 = new Checks.Check11(this.report);
        check11.run(file);

        let check12 = new Checks.Check12(this.report);
        check12.run(file);
    }
}