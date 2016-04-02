var Viz = require("viz.js");
var fs = require("fs");

var FOLDER = "./web/viz/";

var files = fs.readdirSync(FOLDER);
var index = "<html>\n" +
    "<head>\n" +
    "<title>abaplint syntax diagrams</title>\n" +
    "<link rel=\"stylesheet\" type=\"text/css\" href=\"../style/style.css\">\n" +
    "</head>\n" +
    "<body>\n";

for (var file of files) {
    if (/\.txt$/.test(file)) {
        var contents = fs.readFileSync(FOLDER + file,"utf8");
        var result = Viz(contents);
        var target = FOLDER + file.split(".")[0] + ".svg";

        fs.writeFileSync(target, result, "utf8");
        console.log(target);

        var svg = file.split(".")[0] + ".svg";

        index = index + "<div style=\"float:left;text-align:center;\">" +
            "<u>" + svg + "</u><br>\n" +
            "<a href=\"" + svg + "\"><img src=\"" + svg + "\" height=\"300\"></a><br><br>\n" +
            "</div>\n";
    }
}

index = index + "</body>\n</html>\n";
fs.writeFileSync(FOLDER + "index.html", index, "utf8");