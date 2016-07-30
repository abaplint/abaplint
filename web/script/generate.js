var Viz = require("viz.js");
var fs = require("fs");

var statements = "";
var reuse = "";

function run() {
  var folder = "./web/viz/";
  var files = fs.readdirSync(folder);

  for (var file of files) {
    if (/\.txt$/.test(file)) {
      var contents = fs.readFileSync(folder + file,"utf8");
      var result = Viz(contents);
      var target = folder + file.split(".")[0] + ".svg";

      fs.writeFileSync(target, result, "utf8");
//      console.log(target);

      var svg = file.split(".")[0] + ".svg";
      var html = "<div style=\"float:left;text-align:center;\">" +
        "<u>" + svg + "</u><br>\n" +
        "<a href=\"" + svg + "\"><img src=\"" + svg + "\" height=\"300\"></a><br><br>\n" +
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
