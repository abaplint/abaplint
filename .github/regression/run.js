'use strict';
const fs = require("fs");
const childProcess = require("child_process");

// todo, also output analysis runtimes

const repos = JSON.parse(process.env.REPOS);
console.dir(repos);

let map = {};
for (let r of repos) {
  map[r] = {};

  childProcess.execSync("git clone https://github.com/" + r + ".git");

  let folder = r.split("/")[1];

  childProcess.execSync("node ./abaplint_before " + folder + "/abaplint.json -f json > output.json || true");
  map[r].before = JSON.parse(fs.readFileSync("output.json", "utf-8"));

  childProcess.execSync("node ./abaplint_after " + folder + "/abaplint.json -f json > output.json || true");
  map[r].after = JSON.parse(fs.readFileSync("output.json", "utf-8"));
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
    comment += "`" + i.file + "`: " + i.description + ", " + i.start.row + "\n"
  }
}
comment += "\nUpdated: " + new Date().toISOString() + "\n";
comment += "\nSHA: " + process.env.GITHUB_SHA + "\n";

console.dir(comment);

fs.writeFileSync("comment-body.txt", comment);