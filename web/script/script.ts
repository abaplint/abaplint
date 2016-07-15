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

function process(): File {
  let input = (document.getElementById("input") as HTMLInputElement).value;
  input = stripNewline(input);

  let file = new File("foobar.abap", input);
  Runner.run([file]);

  return file;
}

export function issues() {
  let file = process();

  let el = document.getElementById("result");
  el.innerText = buildIssues(file.getRaw(), file);

  el = document.getElementById("info");
  el.innerText = "Issues: " + file.getIssueCount();

  document.getElementById("abap").innerText = file.getRaw();
}

export function tokens() {
  let file = process();
  let inner = "";

  for (let token of file.getTokens()) {
    inner = inner + "\"" + token.getStr() + "\"" + "<br>";
  }

  document.getElementById("info").innerHTML = inner;
}