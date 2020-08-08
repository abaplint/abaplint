'use strict';
const fs = require("fs");

// todo, also output analysis runtimes

console.dir(process.env.REPOS);

let files = fs.readdirSync(".", {withFileTypes: true});
files = files.filter(f => f.isFile());
files = files.filter(f => f.name.endsWith(".json"));
console.dir(files);

let map = {};
for (let f of files) {
  const name = f.name.split("#")[0];
  if (map[name] === undefined) {
    map[name] = {};
  }
  const contents = fs.readFileSync(f.name, "utf-8");
  if (f.name.endsWith("#before.json")) {
    map[name].before = JSON.parse(contents);
  } else {
    map[name].after = JSON.parse(contents);
  }
}

let comment = "Regression test results:\n";
for (let name in map) {
  // todo, this assumes the array content is the same
  if (map[name].before.length === map[name].after.length) {
    comment += "- " + name + ": :green_circle: ";
  } else if (map[name].before.length > map[name].after.length) {
    comment += "- " + name + ": :yellow_circle: ";
  } else {
    comment += "- " + name + ": :red_circle:";
  }
  comment += " " + map[name].before.length + " -> " + map[name].after.length + "\n";

  for (const i of map[name].after) {
    comment += "`" + i.file + "`: " + i.description + "\n"
  }
}
comment += "\nUpdated: " + new Date().toISOString() + "\n";
comment += "\nSHA: " + process.env.GITHUB_SHA + "\n";

console.dir(comment);

fs.writeFileSync("comment-body.txt", comment);