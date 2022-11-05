'use strict';
const fs = require("fs");
const childProcess = require("child_process");

const repos = [
  "ABAP-Logger/ABAP-Logger",
  "abap-observability-tools/abap-metrics-provider",
  "abap-openapi/abap-openapi",
  "abap2xlsx/abap2xlsx",
  "abapGit/abapgit-review-example",
  "abapGit/abapGit",
  "abapGit/ADT_Backend",
  "abapGit/background_modes",
  "abapGit/ci_tools",
  "abapGit/CI",
  "abapGit/performance-test",
  "abapinho/abapTimeMachine",
  "abaplint/abaplint-sci-client",
  "abaplint/deps",
  "exercism/abap",
  "FreHu/abap-turtle-graphics",
  "heliconialabs/abap-opentelemetry",
  "heliconialabs/abap-protobuf",
  "heliconialabs/abap-pulsar",
  "jrodriguez-rc/abap-tasks-tracker",
  "larshp/abap-wasm",
  "larshp/abapGitServer",
  "larshp/abapNTLM",
  "larshp/abapOpenChecks",
  "larshp/abapPGP",
  "larshp/rap_tutorial",
  "Marc-Bernard-Tools/MBT-Base",
  "Marc-Bernard-Tools/MBT-Command-Field",
  "Marc-Bernard-Tools/MBT-Icon-Browser",
  "Marc-Bernard-Tools/MBT-Listcube",
  "Marc-Bernard-Tools/MBT-Logical-Object-Lister",
  "Marc-Bernard-Tools/MBT-Transport-Request",
  "open-abap/open-abap-core",
  "open-abap/open-table-maintenance",
  "SAP/abap-file-formats-tools",
  "SAP/abap-file-formats",
  "SAP/code-pal-for-abap",
  "sbcgua/abap-string-map",
  "sbcgua/ajson",
  "sbcgua/mockup_loader",
  "sbcgua/text2tab",
  "Sumu-Ning/AES",
];

console.dir(repos);

let map = {};
for (let r of repos) {
  map[r] = {};

  childProcess.execSync("git clone --depth=1 --recurse-submodules https://github.com/" + r + ".git");

  let folder = r.split("/")[1];

  let configFile = folder + "/abaplint.json";
  if (fs.existsSync(configFile) === false) {
    configFile = folder + "/abaplint.jsonc";
  }

  map[r].before_start = new Date();
  childProcess.execSync("node ./abaplint_before/cli.js " + configFile + " -f json > output.json || true");
  map[r].before_end = new Date();
  map[r].before = JSON.parse(fs.readFileSync("output.json", "utf-8"));

  map[r].after_start = new Date();
  childProcess.execSync("node ./abaplint_after/cli.js " + configFile + " -f json > output.json || true");
  map[r].after_end = new Date();
  map[r].after = JSON.parse(fs.readFileSync("output.json", "utf-8"));

  try {
    const raw = fs.readFileSync(configFile).toString();
    const reg = new RegExp(/"version": "([\w-]+)"/);
    const match = raw.match(reg);
    map[r].version = match[1].trim();
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
    if (issues.length > 4000) { // keep the comment at a reasonable size
      continue;
    }
    let urlFile = i.file.split("/").splice(1).join("/");
    let url = "https://github.com/" + name + "/blob/main/" + urlFile.replace(/#/g, "%23") + "#L" + i.start.row;
    i.description = i.description.replace(/~/g, "\\~");
    i.description = i.description.replace(/</g, "\\<");
    i.description = i.description.replace(/>/g, "\\>");
    issues += "[`" + i.file + ":" + i.start.row + "`](" + url + "): " + i.description + "(" + i.key + ")\n"
  }
}
comment += "\n" + issues;
comment += "\nUpdated: " + new Date().toISOString() + "\n";
comment += "\nSHA: " + process.env.GITHUB_SHA + "\n";

console.dir(comment);

fs.writeFileSync("comment-body.txt", comment);