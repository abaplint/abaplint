import Runner from "../../src/runner";
import File from "../../src/file";

export function run() {
    var input = (<HTMLInputElement>document.getElementById('input')).value;

    document.getElementById('abap').innerText = input;

    let file = new File("foobar.abap", input);
    let runner = new Runner(file);
    let report = runner.get_report();

    var el = document.getElementById('result');
    el.innerText = 'Errors: ' + report.get_count();
}