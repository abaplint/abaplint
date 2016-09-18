/*global abaplint*/
/*global CodeMirror*/

function stripNewline(input) {
  let result = input;
  while (result.substr(result.length - 1, 1) === "\n") {
    result = result.substr(0, result.length - 1);
  }
  return result;
}

function buildStatements(file) {
  let output = "";

  for (let statement of file.getStatements()) {
    let row = statement.getStart().getRow();
    let col = statement.getStart().getCol();
    let erow = statement.getEnd().getRow();
    let ecol = statement.getEnd().getCol();
// getting the class name only works if uglify does not mangle names
    output = output +
      "<div onmouseover=\"javascript:markLine(" +
      row + ", " + col + ", " + erow + ", " + ecol + ");\">" +
      row + ": " +
      (statement.constructor + "").match(/\w+/g)[1] +
      "</div>\n";
  }

  return output;
}

function buildAst(file) {
  return file.getRoot().viz();
}

function process() {
  let input = editor.getValue();
  input = stripNewline(input);

  let file = new abaplint.File("foobar.abap", input);
  return abaplint.Runner.run([file]);
}

function parse() {
  let input = editor.getValue();
  input = stripNewline(input);

  let file = new abaplint.File("foobar.abap", input);
  return abaplint.Runner.parse([file])[0];
}

// ---------------------

function issues() {
  let issues = process();
  let json = JSON.parse(abaplint.Runner.format(issues, "json"));
  let output = "";
  for (let issue of json) {
    output = output +
      "<div onmouseover=\"javascript:markLine(" + issue.start.row + ", " +
      issue.start.col + ");\">" +
      "[" + issue.start.row + ", "+ issue.start.col + "] " +
      issue.description +
      "</div>\n";
  }
  document.getElementById("info").innerHTML = output;
}

function tokens() {
  let file = parse();
  let inner = "";

  for (let token of file.getTokens()) {
    inner = inner + "\"" + token.getStr() + "\"" + "<br>";
  }

  document.getElementById("info").innerHTML = inner;
}

function statements() {
  let file = parse();
  document.getElementById("info").innerHTML = buildStatements(file);
}

function ast() {
  let file = parse();
  document.getElementById("info").innerHTML = buildAst(file);
}

function downport() {
  let file = abaplint.Runner.downport(parse())[0];
  document.getElementById("info").innerHTML = '<pre>' + file.getRaw() + '</pre>';
}

function types() {
  let info = abaplint.Runner.types(parse());
  document.getElementById("info").innerHTML = info;
}

// ---------------------

var editor = null;
var _mark = null;

function markLine(line, col, eline, ecol) {
  if (_mark) _mark.clear();
  if (!col) col = 0;
  if (!eline) eline = line;
  if (!ecol) ecol = 100;
  _mark = editor.markText({line: line - 1, ch: col - 1},
                          {line: eline - 1, ch: ecol - 1},
                          {className: "styled-background"});
  editor.scrollIntoView({line: line - 1, ch: 0}, 200);
}

function run() {
  editor = CodeMirror.fromTextArea(document.getElementById("input"), {
    lineNumbers: true,
    theme: "mbo",
    tabSize: 2,
    styleSelectedText: true,
    mode: "abap"
  });

  editor.setSize(null, "100%");

  document.getElementById("abaplintver").innerHTML = abaplint.Runner.version();
}

run();