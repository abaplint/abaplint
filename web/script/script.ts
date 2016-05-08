import Runner from "../../src/runner";
import File from "../../src/file";

function strip_newline(input: string): string {
    let result = input;
    while (result.substr(result.length - 1, 1) === "\n") {
        result = result.substr(0, result.length - 1);
    }
    return result;
}

function build_issues(input: string, file: File): string {
    let lines = input.split("\n");

    for (let i = 0; i < lines.length; i++) {
        lines[i] = "" + ( i + 1 );
    }

    for (let issue of file.get_issues()) {
        let row = issue.get_row();
        lines[row - 1] = lines[row - 1] + " " + issue.get_description();
    }

    return lines.join("\n");
}

// todo, split this file up in frontend and backend
// the frontend stuff does not need to be browserify'ed
export function run_file(input: string): string {
    let file = new File("foobar.abap", input);
    Runner.run([file]);

    let ret = "";
    for (let issue of file.get_issues()) {
        ret = ret + "{\"row\": \"" + issue.get_row() + "\", \"text\": \"" + issue.get_description() + "\"},";
    }
    ret = ret.substring(0, ret.length - 1);

    return "{ \"errors\": [" + ret + "] }";
}

export function run() {
    let input = (document.getElementById("input") as HTMLInputElement).value;
    input = strip_newline(input);

    document.getElementById("abap").innerText = input;

    let file = new File("foobar.abap", input);
    Runner.run([file]);

    let el = document.getElementById("result");
    el.innerText = build_issues(input, file);

    el = document.getElementById("info");
    el.innerText = "Issues: " + file.get_count();
}