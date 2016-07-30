var Viz = require("viz.js");
var Railroad = require("railroad-diagrams");
var fs = require("fs");

var statements = "";
var reuse = "";

function run() {
  var folder = "./web/viz/";
  var files = fs.readdirSync(folder);

  for (var file of files) {
    var contents = fs.readFileSync(folder + file,"utf8");
    var run = false;
    var add = "";

    if (/\.viz\.txt$/.test(file)) {
      var result = Viz(contents);
      var target = folder + file.split(".")[0] + ".viz.svg";
      fs.writeFileSync(target, result, "utf8");
      run = true;
      add = "height=\"300\"";
    } else if (/\.railroad\.txt$/.test(file)) {
      var css = "<defs>\n" +
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
        "fill: hsl(120,100%,90%);\n" +
        "}\n" +
        "path.diagram-text {\n" +
        "stroke-width: 3;\n" +
        "stroke: black;\n" +
        "fill: white;\n" +
        "cursor: help;\n" +
        "}\n" +
        "g.diagram-text:hover path.diagram-text {\n" +
        "fill: #eee;\n" +
        "}\n" +
        "]]></style>\n" +
        "</defs>\n";
//      console.log(file);
      var result = eval(contents);
      result = result.replace(/<svg /, "<svg xmlns=\"http://www.w3.org/2000/svg\" ");
      result = result.replace(/<g transform/, css + "<g transform");
      var target = folder + file.split(".")[0] + ".railroad.svg";
      fs.writeFileSync(target, result, "utf8");
      run = true;
      add = "width=\"300\"";
    }

    if (run === true) {
      var svg = file.split(".")[0] + "." + file.split(".")[1] + ".svg";
      var html = "<div style=\"float:left;text-align:center;\">" +
        "<u>" + svg + "</u><br>\n" +
        "<a href=\"" + svg + "\"><img src=\"" + svg + "\" " + add + "></a><br><br>\n" +
        "</div>\n";

      if (/^reuse_/.test(svg)) {
        reuse = reuse + html;
      } else {
        statements = statements + html;
      }
    }
  }
}

function generate() {
  run();

  var index = "<html>\n" +
    "<head>\n" +
    "<title>abaplint syntax diagrams</title>\n" +
    "<link rel=\"stylesheet\" type=\"text/css\" href=\"../style/style.css\">\n" +
    "</head>\n" +
    "<body>\n" +
    "<h1>Statements</h1>\n";
  index = index + statements;
  index = index + "<div style=\"clear:both;\">\n<h1>Reuse</h1>\n";
  index = index + reuse;
  index = index + "</div>\n";

  index = index + "</body>\n</html>\n";
  fs.writeFileSync("./web/viz/index.html", index, "utf8");
}

generate();
