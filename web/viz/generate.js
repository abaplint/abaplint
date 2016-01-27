var Viz = require("viz.js");
var fs = require("fs");

var FOLDER = "./web/viz/";

var files = fs.readdirSync(FOLDER);

for (var file of files) {
    if (/\.txt$/.test(file)) {
        var contents = fs.readFileSync(FOLDER + file,"utf8");
        var result = Viz(contents);
        var target = FOLDER + file.split(".")[0] + ".svg";
        fs.writeFileSync(target, result, "utf8");
        console.log(target);
    }
}