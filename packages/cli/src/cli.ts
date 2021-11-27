import * as minimist from "minimist";
import {run, GENERIC_ERROR, Arguments} from ".";

const parsed = minimist(process.argv.slice(2), {boolean: ["p", "c", "fix", "rename"]});

let format = "standard";
if (parsed["f"] !== undefined || parsed["format"] !== undefined) {
  format = parsed["f"] ? parsed["f"] : parsed["format"];
}

const arg: Arguments = {
  configFilename: parsed._[0],
  format,
  compress: parsed["c"],
  parsingPerformance: parsed["p"],
  showHelp: parsed["h"] !== undefined || parsed["help"] !== undefined,
  showVersion: parsed["v"] !== undefined || parsed["version"] !== undefined,
  outputDefaultConfig: parsed["d"] !== undefined || parsed["default"] !== undefined,
  runFix: parsed["fix"],
  runRename: parsed["rename"],
  outFormat: parsed["outformat"],
  outFile: parsed["outfile"],
};

run(arg).then(({output, issues}) => {
  if (output.length > 0) {
    process.stdout.write(output, () => {
      if (issues.length > 0) {
        if (issues[0].getKey() === GENERIC_ERROR) {
          process.exit(2); // eg. "git" does not exist in system
        } else {
          process.exit(1);
        }
      } else {
        process.exit();
      }
    });
  } else {
    process.exit();
  }
}).catch((err) => {
  console.log(err);
  process.exit(2);
});