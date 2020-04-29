const fs = require("fs");
const path = require("path");
const abaplint = require("../build/src/index");

// adds the description on top level, so boolean configs also have descriptions
function run() {
  const filename = __dirname + path.sep + "schema.json";

  const schema = JSON.parse(fs.readFileSync(filename, "utf8"));

  const descriptions = {};
  for (const d in schema.definitions) {
    const description = schema.definitions[d].description;
    if (description !== undefined) {
      descriptions[d] = description;
    }
  }

  for(const rule of abaplint.ArtifactsRules.getRules()) {
    const meta = rule.getMetadata();
    if (meta.shortDescription !== undefined) {
      const extra = meta.tags ? "\nTags: " + meta.tags.join(", ") : "";
      descriptions[meta.key] = meta.shortDescription + extra;
    }
  }

  const rules = schema.definitions.IConfig.properties.rules.properties;
  for (const rule in rules) {
    const name = rules[rule].anyOf[0]["$ref"].split("/")[2];

    const description = descriptions[name] ? descriptions[name] : descriptions[rule];
    if (description === undefined) {
      console.log("Missing jsdoc/rule description: " + name);
      process.exit(1);
    }
    rules[rule].description = description + "\nhttps://rules.abaplint.org/" + rule;
  }

  fs.writeFileSync(filename, JSON.stringify(schema, null, 2));
}

run();