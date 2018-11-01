"use strict";

// used for generating "syntax"

var Railroad = require("railroad-diagrams");
var fs = require("fs");

let folder = "./syntax/";

function generateSVG(input) {
  let css = "<defs>\n" +
  "<style type=\"text/css\"><![CDATA[\n" +
  "path {\n" +
  "stroke-width: 3;\n" +
  "stroke: black;\n" +
  "fill: rgba(0,0,0,0);\n" +
  "}\n" +
  "text {\n" +
  "font: bold 14px monospace;\n" +
  "text-anchor: middle;\n" +
  "}\n" +
  "text.diagram-text {\n" +
  "font-size: 12px;\n" +
  "}\n" +
  "a {\n" +
  "fill: blue;\n" +
  "}\n" +
  "text.diagram-arrow {\n" +
  "font-size: 16px;\n" +
  "}\n" +
  "text.label {\n" +
  "text-anchor: start;\n" +
  "}\n" +
  "text.comment {\n" +
  "font: italic 12px monospace;\n" +
  "}\n" +
  "rect {\n" +
  "stroke-width: 3;\n" +
  "stroke: black;\n" +
  "fill: #BCBCBC;\n" +
  "}\n" +
  "path.diagram-text {\n" +
  "stroke-width: 3;\n" +
  "stroke: black;\n" +
  "fill: #BCBCBC;\n" +
  "cursor: help;\n" +
  "}\n" +
  "]]></style>\n" +
  "</defs>\n";

  let result = eval(input.railroad);
  result = result.replace(/<svg /, "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" ");
  result = result.replace(/<g transform/, css + "<g transform");

  let target = folder + input.type + "_" + input.name + ".svg";
  fs.writeFileSync(target, result, "utf8");

  return result;
}

function run() {

  let file = JSON.parse(fs.readFileSync(folder + "generated.json", "utf8"));

  for (let index in file.structures) {
    file.structures[index].svg = generateSVG(file.structures[index]);
  }
  for (let index in file.statements) {
    file.statements[index].svg = generateSVG(file.statements[index]);
  }
  for (let index in file.expressions) {
    file.expressions[index].svg = generateSVG(file.expressions[index]);
  }
  return file;
}

function generate() {
  let json = run();
  fs.writeFileSync(folder + "data.json.js", "data = " + JSON.stringify(json, null, 2) + ";", "utf8");
}

generate();