'use strict';
const fs = require("fs");
const childProcess = require("child_process");

const repos = JSON.parse(process.env.REPOS).sort();
console.dir(repos);

let map = {};
for (let r of repos) {
  map[r] = {};

  childProcess.execSync("git clone --recurse-submodules https://github.com/" + r + ".git");

  let folder = r.split("/")[1];

  map[r].before_start = new Date();
  childProcess.execSync("node ./abaplint_before " + folder + "/abaplint.json -f json > output.json || true");
  map[r].before_end = new Date();
  map[r].before = JSON.parse(fs.readFileSync("output.json", "utf-8"));

  map[r].after_start = new Date();
  childProcess.execSync("node ./abaplint_after " + folder + "/abaplint.json -f json > output.json || true");
  map[r].after_end = new Date();
  map[r].after = JSON.parse(fs.readFileSync("output.json", "utf-8"));

  try {
    map[r].version = require(`./${folder}/abaplint.json`).syntax.version;
    map[r].version = map[r].version.trim();
  } catch {
    map[r].version = "?";
  }
}

let issues = "";
let comment = "Regression test results:\n";

comment += "| Repository | Issues | Runtime | Target Version |\n";
comment += "| :--- | :--- | :--- | :--- |\n";
for (let name in map) {
  const link = "[" + name + "](https://github.com/" + name + ")"
  // todo, this assumes the array content is the same
  if (map[name].before.length === map[name].after.length) {
    comment += "| " + link + "| :green_circle: ";
  } else if (map[name].before.length > map[name].after.length) {
    comment += "| " + link + "| :yellow_circle: ";
  } else {
    comment += "| " + link + "| :red_circle:";
  }

  let runtimeBefore = Math.ceil( ( map[name].before_end - map[name].before_start ) / 1000);
  let runtimeAfter = Math.ceil( ( map[name].after_end - map[name].after_start ) / 1000);
  let runtimeIcon = Math.abs(runtimeBefore - runtimeAfter) > 2 ? ":yellow_circle:" : ":green_circle:";
  let runtimeInfo = runtimeIcon + " " + runtimeBefore + "s -> " + runtimeAfter + "s";
  comment += " " + map[name].before.length + " -> " + map[name].after.length + "| " + runtimeInfo + " | ";

  comment += map[name].version.trim() + " |\n";

  for (const i of map[name].after) {
    if (issues.length > 3000) { // keep the comment at a reasonable size
      continue;
    }
    let urlFile = i.file.split("/").splice(1).join("/");
    let url = "https://github.com/" + name + "/blob/master/" + urlFile + "#L" + i.start.row;
    issues += "[`" + i.file + ":" + i.start.row + "`](" + url + "): " + i.description + "(" + i.key + ")\n"
  }
}
comment += "\n" + issues;
comment += "\nUpdated: " + new Date().toISOString() + "\n";
comment += "\nSHA: " + process.env.GITHUB_SHA + "\n";

console.dir(comment);

fs.writeFileSync("comment-body.txt", comment);