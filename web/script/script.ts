import Runner from "../../src/runner";
import Report from "../../src/report";
import File from "../../src/file";

function strip_newline(input: string): string {
    let result = input;
    while (result.substr(result.length - 1, 1) === "\n") {
        result = result.substr(0, result.length - 1);
    }
    return result;
}

function build_issues(input: string, report: Report, file: File): string {
    let lines = input.split("\n");

    for (let i = 0; i < lines.length; i++) {
        lines[i] = "" + ( i + 1 );
    }

    for (let issue of report.get_issues()) {
        let row = issue.get_row();
        lines[row - 1] = lines[row - 1] + " " + issue.get_description();
    }

    return lines.join("\n");
}

export function run() {
    let input = (<HTMLInputElement>document.getElementById("input")).value;
    input = strip_newline(input);

    document.getElementById("abap").innerText = input;

    let file = new File("foobar.abap", input);
    let runner = new Runner(file);
    let report = runner.get_report();

    let el = document.getElementById("result");
    el.innerText = build_issues(input, report, file);

    el = document.getElementById("info");
    el.innerText = "Issues: " + report.get_count();
}