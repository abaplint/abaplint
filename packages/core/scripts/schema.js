const fs = require("fs");
const path = require("path");
const abaplint = require("../build/src/index");

function getFiles(dir) {
  const ret = [];
  for (const d of fs.readdirSync(dir, {withFileTypes: true})) {
    if (d.isDirectory()) {
      for (const sub of getFiles(dir + d.name + path.sep)) {
        ret.push(d.name + "/" + sub);
      }
    } else {
      ret.push(d.name);
    }
  }
  return ret;
}

const ruledir = "../src/rules/";
const rulefiles = getFiles(__dirname + path.sep + ruledir);

function findFile(key) {
  for (const file of rulefiles) {
    if (file === key + ".ts" || file.endsWith("/" + key + ".ts")) {
      const res = file.substring(0, file.length - 3);
      return res;
    }
  }
  throw new Error("File for " + key + " not found");
}

const rules = [];
for(const rule of abaplint.ArtifactsRules.getRules()) {
  rules.push({key: rule.getMetadata().key, config: rule.getConfig().constructor.name});
}
rules.sort((a, b) => { return a.key.localeCompare(b.key); });

let output = "import {IGlobalConfig, IDependency, ISyntaxSettings, IRenameSettings} from \"../src/_config\";\n";
for(const rule of rules) {
  output = output + "import {" + rule.config + "} from \"" + ruledir + findFile(rule.key) + "\";\n";
}

// todo, take this part automatically from the typescript code
output = output + `\nexport interface IConfig {
  global: IGlobalConfig;
  /** External git dependencies used for syntax checks */
  dependencies?: IDependency[];
  syntax: ISyntaxSettings;
  rename?: IRenameSettings;
  rules: {\n`;
for (const rule of rules) {
  output = output + "    \"" + rule.key + "\"?: " + rule.config + " | boolean" + ",\n";
}
output = output + "  };\n" +
"}";

console.log(output);
