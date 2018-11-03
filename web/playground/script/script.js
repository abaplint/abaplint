/*global abaplint*/
/*global CodeMirror*/

let config = new abaplint.Config.getDefault();

function stripNewline(input) {
  let result = input;
  while (result.substr(result.length - 1, 1) === "\n") {
    result = result.substr(0, result.length - 1);
  }
  return result;
}

function outputNodes(nodes) {
  let ret = "<ul>";
  for (let node of nodes) {
    let extra = "";
    switch(node.constructor.name) {
      case "TokenNode":
        extra = node.name + ", \"" + node.getToken().getStr() + "\"";
        break;
      case "ReuseNode":
        extra = "<a href=\"./viz/expression_" + node.getName() + ".svg\">" + node.getName() + "</a>" +
          outputNodes(node.getChildren());
        break;
    }

    ret = ret + "<li>" + node.constructor.name + ", " + extra + "</li>";
  }
  return ret + "</ul>";
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
      "<b><div onmouseover=\"javascript:markLine(" +
      row + ", " + col + ", " + erow + ", " + ecol + ");\">" +
      row + ": " +
      "<a href=\"./viz/statement_" + statement.constructor.name + ".svg\">" +
      statement.constructor.name +
      "</a>" +
      "</div></b>\n" + outputNodes(statement.getChildren());
  }

  return output;
}

function buildAst(file) {
  return file.getRoot().viz();
}

function process() {
  let input = stripNewline(editor.getValue());
  let file = new abaplint.File("foobar.prog.abap", input);
  return new abaplint.Runner([file], config).findIssues();
}

function parse() {
  let input = stripNewline(editor.getValue());
  let file = new abaplint.File("foobar.prog.abap", input);
  return new abaplint.Runner([file], config).parse()[0];
}

// ---------------------

function issues() {
  let issues = process();
  let json = JSON.parse(abaplint.Formatter.format(issues, "json"));
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

  let inner = "<table>";
  for (let token of file.getTokens()) {
    inner = inner + "<tr><td>\"" +
      token.getStr() + "\"</td><td>" +
      token.constructor.name + "</td></tr>";
  }
  inner = inner + "</table>";

  document.getElementById("info").innerHTML = inner;
}

function statements() {
  let file = parse();
  document.getElementById("info").innerHTML = buildStatements(file);
}

function structure() {
  let file = parse();
  document.getElementById("info").innerHTML = buildAst(file);
  // todo
}

function escape(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
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

function changeVersion(evt) {
  config.setVersion(abaplint.textToVersion(evt.target.value));
}

function popuplateVersionDropdown() {
  let options = "";
  for(let version in abaplint.Version) {
    if (!isNaN(Number(version))) {
      let selected = "";
      if (abaplint.Config.defaultVersion + "" === version + "") { // huh?
        selected = " selected";
      }
      options = options + "<option value=\"" + abaplint.Version[version] + "\"" + selected + ">" +
        abaplint.Version[version] + "</option>\n";
    }
  }
  document.getElementById("version_dropdown").innerHTML = options;
  document.getElementById("version_dropdown").onchange = changeVersion;
}

function run() {
  editor = CodeMirror.fromTextArea(document.getElementById("input"), {
    lineNumbers: true,
    theme: "mbo",
    tabSize: 2,
    styleSelectedText: true,
    mode: "abap"
  });
  popuplateVersionDropdown();
  editor.setSize(null, "100%");
  document.getElementById("abaplintver").innerHTML = abaplint.Runner.version();
}

run();