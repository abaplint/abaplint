const fs = require("fs");

const [, , command, source, target] = process.argv;

if (command === "rm") {
  fs.rmSync(source, {recursive: true, force: true});
} else if (command === "copy") {
  fs.cpSync(source, target, {recursive: true});
} else {
  throw new Error(`Unknown command: ${command}`);
}
