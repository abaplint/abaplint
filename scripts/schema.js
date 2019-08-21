const fs = require("fs");
const abaplint = require("../build/src/index");

function getFiles(dir) {
  const ret = [];
  for (const d of fs.readdirSync(dir, {withFileTypes: true})) {
    if (d.isDirectory()) {
      for (const sub of getFiles(dir + d.name + "/")) {
        ret.push(d.name + "/" + sub);
      }
    } else {
      ret.push(d.name);
    }
  }
  return ret;
}

const ruledir = "../src/rules/";
const rulefiles = getFiles(__dirname + "/" + ruledir);

function findFile(key) {
  for (const file of rulefiles) {
    if (file.endsWith(key + ".ts")) {
      return file.substring(0, file.length - 3);
    }
  }
  console.dir(rulefiles);
  throw new Error("File for " + key + " not found");
}

const rules = [];
for(const rule of abaplint.Artifacts.getRules()) {
  rules.push({key: rule.getKey(), config: rule.getConfig().constructor.name});
}
rules.sort((a, b) => { return a.key.localeCompare(b.key); });

let output = "import {IGlobalConfig, IDependency, ISyntaxSettings} from \"../src/config\";\n";
for(const rule of rules) {
  output = output + "import {" + rule.config + "} from \"" + ruledir + findFile(rule.key) + "\";\n";
}

output = output + "\nexport interface IConfig {\n" +
"  global: IGlobalConfig;\n" +
"  dependencies: IDependency[];\n" +
"  syntax: ISyntaxSettings;\n" +
"  rules: {\n";
for (const rule of rules) {
  output = output + "    \"" + rule.key + "\": " + rule.config + ",\n";
}
output = output + "  };\n" +
"}";

console.log(output);