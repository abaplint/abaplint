const fs = require("fs");
const path = require("path");

// adds the description on top level, so boolean configs also have descriptions
function run() {
  const filename = __dirname + path.sep + "schema.json";

  const schema = JSON.parse(fs.readFileSync(filename, "utf8"));

  const descriptions = {};
  for (const d in schema.definitions) {
    const description = schema.definitions[d].description;
    if (d.endsWith("Conf") && description === undefined) {
      console.log("Missing jsdoc description: " + d);
      process.exit(1);
    } else if (description !== undefined) {
      descriptions[d] = description;
    }
  }

  const rules = schema.definitions.IConfig.properties.rules.properties;
  for (const rule in rules) {
    const name = rules[rule].anyOf[0]["$ref"].split("/")[2];
    rules[rule].description = descriptions[name];
  }

  fs.writeFileSync(filename, JSON.stringify(schema, null, 2));
}

run();