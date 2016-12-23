import Runner from "./runner";
import {File} from "./file";
import {Issue} from "./issue";
import Config from "./config";
import {versionText} from "./version";
import * as fs from "fs";
import * as path from "path";
import * as glob from "glob";
import * as minimist from "minimist";

let argv = minimist(process.argv.slice(2));
let format = "default";
let output = "";
let files: Array<File> = [];
let issues: Array<Issue> = [];

function searchConfig(filename: string): Config {
  let json = searchUp(path.dirname(process.cwd() + path.sep + filename) + path.sep);
  if (json === undefined) {
    return Config.getDefault();
  } else {
    return new Config(json);
  }
}

function searchUp(dir: string): string {
  let file = dir + "abaplint.json";
  if (fs.existsSync(file)) {
    return fs.readFileSync(file, "utf8");
  }

  let up = path.normalize(dir + ".." + path.sep);
  if (path.normalize(up) !== dir) {
    return searchUp(up);
  }

  return undefined;
}


if (argv["f"] !== undefined || argv["format"] !== undefined) {
  if (argv["f"] !== undefined) {
    format = argv["f"];
  } else {
    format = argv["format"];
  }
}

if (argv["h"] !== undefined || argv["help"] !== undefined) {
  output = output + "Usage: abaplint [options] [file ...]\n";
  output = output + "\n";
  output = output + "Options:\n";
  output = output + "  -h, --help       display this help\n";
  output = output + "  -f, --format     output format (standard, total, json, summary)\n";
  output = output + "  -v, --version    current version\n";
  output = output + "  -a [abap]        specify ABAP version\n";
  output = output + "  -s               show progress\n";
  output = output + "  -d, --default    show default configuration\n";
} else if (argv["v"] !== undefined || argv["version"] !== undefined) {
  output = output + Runner.version() + "\n";
} else if (argv["d"] !== undefined || argv["default"] !== undefined) {
  output = output + JSON.stringify(Config.getDefault().get()) + "\n";
} else if (argv._[0] === undefined) {
  output = output + "Supply filename\n";
} else {
  for (const file of argv._) {
    glob.sync(file, {nosort: true}).forEach((filename) => {
      files.push(new File(filename, fs.readFileSync(filename, "utf8")));
    } );
  }

  if (files.length === 0) {
    output = output + "No files found\n";
  } else {
    let config = searchConfig(files[0].getFilename());

    if (argv["a"]) {
      config.setVersion(versionText(argv["a"]));
    }
    if (argv["s"]) {
      config.setShowProgress(true);
    }
    issues = Runner.run(files, config);
    output = Runner.format(issues, format);
  }
}

process.stdout.write(output, () => {
  if (issues.length > 0) {
    process.exit(1);
  }
});