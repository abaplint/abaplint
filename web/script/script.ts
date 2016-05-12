import Runner from "../../src/runner";
import File from "../../src/file";

function stripNewline(input: string): string {
  let result = input;
  while (result.substr(result.length - 1, 1) === "\n") {
    result = result.substr(0, result.length - 1);
  }
  return result;
}

function buildIssues(input: string, file: File): string {
  let lines = input.split("\n");

  for (let i = 0; i < lines.length; i++) {
    lines[i] = "" + ( i + 1 );
  }

  for (let issue of file.getIssues()) {
    let row = issue.getStart().getRow();
    lines[row - 1] = lines[row - 1] + " " + issue.getDescription();
  }

  return lines.join("\n");
}

export function runFile(input: string): string {
  let file = new File("foobar.abap", input);
  Runner.run([file]);

  let ret = "";
  for (let issue of file.getIssues()) {
    ret = ret + "{\"row\": \"" + issue.getStart().getRow() + "\", \"text\": \"" + issue.getDescription() + "\"},";
  }
  ret = ret.substring(0, ret.length - 1);

  return "{ \"errors\": [" + ret + "] }";
}

export function run() {
  let input = (document.getElementById("input") as HTMLInputElement).value;
  input = stripNewline(input);

  document.getElementById("abap").innerText = input;

  let file = new File("foobar.abap", input);
  Runner.run([file]);

  let el = document.getElementById("result");
  el.innerText = buildIssues(input, file);

  el = document.getElementById("info");
  el.innerText = "Issues: " + file.getIssueCount();
}