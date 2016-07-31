var Railroad = require("railroad-diagrams");
var fs = require("fs");

var statements = "";
var reuse = "";

function run() {
  var folder = "./web/viz/";
  var files = fs.readdirSync(folder);

  for (var file of files) {
    if (/\.txt$/.test(file)) {
      var contents = fs.readFileSync(folder + file,"utf8");

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
      var result = eval(contents);
      result = result.replace(/<svg /, "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" ");
      result = result.replace(/<g transform/, css + "<g transform");
      var target = folder + file.split(".")[0] + ".svg";
      fs.writeFileSync(target, result, "utf8");

      var svg = file.split(".")[0] + ".svg";
      var html = "<div style=\"float:left;text-align:center;\">" +
        "<u>" + svg + "</u><br>\n" +
        "<a href=\"" + svg + "\"><img src=\"" + svg + "\" width=\"300\"></a><br><br>\n" +
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
