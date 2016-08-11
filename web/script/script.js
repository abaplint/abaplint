/*global abaplint*/

function stripNewline(input) {
  let result = input;
  while (result.substr(result.length - 1, 1) === "\n") {
    result = result.substr(0, result.length - 1);
  }
  return result;
}

function initLines(input) {
  let lines = input.split("\n");

  for (let i = 0; i < lines.length; i++) {
    lines[i] = "" + ( i + 1 );
  }

  return lines;
}

function buildIssues(input, file) {
  let lines = initLines(input);

  for (let issue of file.getIssues()) {
    let row = issue.getStart().getRow();
    lines[row - 1] = lines[row - 1] + " " + issue.getDescription();
  }

  return lines.join("\n");
}

function buildStatements(input, file) {
  let lines = initLines(input);

  for (let statement of file.getStatements()) {
    let row = statement.getStart().getRow();
// getting the class name only works if uglify does not mangle names
    lines[row - 1] = lines[row - 1] + " " + (statement.constructor + "").match(/\w+/g)[1];
  }

  return lines.join("\n");
}

function buildAst(file) {
  let ret = "";

  for (let statement of file.getStatements()) {
    if (statement.getRoot()) {
      ret = ret + statement.getRoot().viz() + "<br>";
    } else {
      console.log("missing root, " + statement.concatTokens());
    }
  }

  return ret;
}

function process() {
  let input = document.getElementById("input").value;
  input = stripNewline(input);

  let file = new abaplint.File("foobar.abap", input);
  abaplint.Runner.run([file]);

  return file;
}

// ---------------------

function issues() {
  let file = process();

  let el = document.getElementById("info");
  el.innerText = "Issues: " + file.getIssueCount();

  el = document.getElementById("result");
  el.innerText = buildIssues(file.getRaw(), file);

  document.getElementById("abap").innerText = file.getRaw();
}

function tokens() {
  let file = process();
  let inner = "";

  for (let token of file.getTokens()) {
    inner = inner + "\"" + token.getStr() + "\"" + "<br>";
  }

  document.getElementById("info").innerHTML = inner;
}

function statements() {
  let file = process();

  let el = document.getElementById("result");
  el.innerText = buildStatements(file.getRaw(), file);

  document.getElementById("abap").innerText = file.getRaw();
}

function ast() {
  let file = process();

  let el = document.getElementById("info");
  el.innerHTML = buildAst(file);

  document.getElementById("abap").innerText = file.getRaw();
}