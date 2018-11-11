/*global abaplint*/
/*global CodeMirror*/

let registry = new abaplint.Registry().addFile(new abaplint.File("foobar.prog.abap", "dummy"));

function stripNewline(input) {
  let result = input;
  while (result.substr(result.length - 1, 1) === "\n") {
    result = result.substr(0, result.length - 1);
  }
  return result;
}

function linkToStatement(statement) {
  return "<a href=\"https://syntax.abaplint.org/#/statement/" + statement.constructor.name + "\">" +
    statement.constructor.name + "</a>";
}

function linkToStructure(structure) {
  return "<a href=\"https://syntax.abaplint.org/#/structure/" + structure.constructor.name + "\">" +
    structure.constructor.name + "</a>";
}

function linkToExpression(expression) {
  return "<a href=\"https://syntax.abaplint.org/#/expression/" + expression.constructor.name + "\">" +
    expression.constructor.name + "</a>";
}

function outputNodes(nodes) {
  let ret = "<ul>";
  for (let node of nodes) {
    let extra = "";
    switch(node.constructor.name) {
      case "TokenNode":
        extra = node.get().constructor.name + ", \"" + node.get().getStr() + "\"";
        break;
      case "ExpressionNode":
        extra = linkToExpression(node.get()) + outputNodes(node.getChildren());
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
      linkToStatement(statement.get()) +
      "</div></b>\n" + outputNodes(statement.getChildren());
  }

  return output;
}

function buildStructure(nodes) {
  let output = "<ul>";
  for(let node of nodes) {
    if (node instanceof abaplint.Nodes.StructureNode) {
      output = output + "<li>" + linkToStructure(node.get()) + ", Structure " + buildStructure(node.getChildren()) + "</li>";
    } else if (node instanceof abaplint.Nodes.StatementNode) {
      output = output + "<li>" + linkToStatement(node.get()) + ", Statement</li>";
    }
  }
  return output + "</ul>";
}

function process(val = undefined) {
  let input = stripNewline(val ? val : editor.getValue());
  let file = new abaplint.File("foobar.prog.abap", input);
  return registry.updateFile(file).findIssues();
}

function parse() {
  let input = stripNewline(editor.getValue());
  let file = new abaplint.File("foobar.prog.abap", input);
  return registry.updateFile(file).parse().getABAPFiles()[0];
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
  document.getElementById("info").innerHTML = buildStatements(parse());
}

function structure() {
  document.getElementById("info").innerHTML = buildStructure([parse().getStructure()]);
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
  let conf = registry.getConfig();
  conf.setVersion(abaplint.textToVersion(evt.target.value));
  registry.setConfig(conf);
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

function validator(text, options) {
  let ret = [];
  for (let issue of process(text)) {
    const hint = {
      message: issue.getMessage(),
      severity: "error",
      from: CodeMirror.Pos(issue.getStart().getRow() - 1, issue.getStart().getCol()),
      to: CodeMirror.Pos(issue.getEnd().getRow() - 1, issue.getEnd().getCol())
    };
    ret.push(hint);
  }
  return ret;
}

function run() {
  CodeMirror.registerHelper("lint", "abap", validator);
  editor = CodeMirror.fromTextArea(document.getElementById("input"), {
    lineNumbers: true,
    lint: true,
    theme: "mbo",
    tabSize: 2,
    gutters: ["CodeMirror-lint-markers"],
    styleSelectedText: true,
    mode: "abap"
  });
  popuplateVersionDropdown();
  editor.setSize(null, "100%");
  document.getElementById("abaplintver").innerHTML = abaplint.Runner.version();
}

run();