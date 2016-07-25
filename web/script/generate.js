var Viz = require("viz.js");
var fs = require("fs");

function handleFolder(input) {
  var index = "";
  var folder = "./web/viz/" + input;
  var files = fs.readdirSync(folder);
  for (var file of files) {
    if (/\.txt$/.test(file)) {
      var contents = fs.readFileSync(folder + file,"utf8");
      var result = Viz(contents);
      var target = folder + file.split(".")[0] + ".svg";

      fs.writeFileSync(target, result, "utf8");
//      console.log(target);

      var svg = file.split(".")[0] + ".svg";

      index = index + "<div style=\"float:left;text-align:center;\">" +
        "<u>" + svg + "</u><br>\n" +
        "<a href=\"" + input + svg + "\"><img src=\"" + input + svg + "\" height=\"300\"></a><br><br>\n" +
        "</div>\n";
    }
  }
  return index;
}

function generate() {
  var index = "<html>\n" +
    "<head>\n" +
    "<title>abaplint syntax diagrams</title>\n" +
    "<link rel=\"stylesheet\" type=\"text/css\" href=\"../style/style.css\">\n" +
    "</head>\n" +
    "<body>\n" +
    "<h1>Statements</h1>\n";
  index = index + handleFolder("");
  index = index + "<div style=\"clear:both;\">\n<h1>Reuse</h1>\n";
  index = index + handleFolder("reuse/");
  index = index + "</div>\n";

  index = index + "</body>\n</html>\n";
  fs.writeFileSync("./web/viz/index.html", index, "utf8");
}

generate();
