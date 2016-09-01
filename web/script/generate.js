"use strict";

var Railroad = require("railroad-diagrams");
var fs = require("fs");

function run() {
  let json = {};
  json.statements = [];
  json.reuse = [];
  
  let folder = "./web/viz/";
  let files = fs.readdirSync(folder);

  for (let file of files) {
    if (/\.txt$/.test(file)) {
      let contents = fs.readFileSync(folder + file,"utf8");

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
//      console.log(file);
      let result = eval(contents);
      result = result.replace(/<svg /, "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" ");
      result = result.replace(/<g transform/, css + "<g transform");
      let target = folder + file.split(".")[0] + ".svg";
      fs.writeFileSync(target, result, "utf8");

      let name = file.split(".")[0];

      if (/^reuse_/.test(name)) {
        json.reuse.push(name);
      } else {
        json.statements.push(name);
      }
    }
  }
  
  return json;
}

function generate() {
  let json = run();
  
  fs.writeFileSync("./web/viz/data.json", JSON.stringify(json), "utf8");
}

generate();
