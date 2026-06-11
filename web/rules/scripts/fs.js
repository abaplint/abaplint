const fs = require("fs");
const path = require("path");

const [, , command, source, target] = process.argv;

if (command === "copy") {
  fs.cpSync(source, target, {recursive: true});
} else if (command === "copy-contents") {
  fs.mkdirSync(target, {recursive: true});
  for (const entry of fs.readdirSync(source)) {
    fs.cpSync(path.join(source, entry), path.join(target, entry), {recursive: true});
  }
} else {
  throw new Error(`Unknown command: ${command}`);
}
