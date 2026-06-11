const fs = require("fs");
const path = require("path");

const packageJson = require("../package.json");

for (const filename of [
  path.join(__dirname, "..", "build", "src", "registry.js"),
  path.join(__dirname, "..", "build", "web", "src", "registry.js"),
]) {
  if (fs.existsSync(filename)) {
    const contents = fs.readFileSync(filename, "utf8");
    fs.writeFileSync(filename, contents.replaceAll("{{ VERSION }}", packageJson.version));
  }
}
