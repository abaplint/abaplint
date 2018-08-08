import Runner from "./runner";
import {File, ParsedFile} from "./file";
import {Issue} from "./issue";
import Config from "./config";
import {textToVersion} from "./version";
import * as ProgressBar from "progress";
import * as fs from "fs";
import * as path from "path";
import * as glob from "glob";
import * as minimist from "minimist";
import * as cluster from "cluster";
import * as os from "os";

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

function displayHelp(): string {
  let output = "";
  output = output + "Usage: abaplint [options] [file ...]\n";
  output = output + "\n";
  output = output + "Options:\n";
  output = output + "  -h, --help       display this help\n";
  output = output + "  -f, --format     output format (standard, total, json, summary)\n";
  output = output + "  -v, --version    current version\n";
  output = output + "  -a [abap]        specify ABAP version\n";
  output = output + "  -s               show progress\n";
  output = output + "  -m               enable multithreading\n";
  output = output + "  -d, --default    show default configuration\n";
  return output;
}

function loadFileNames(args): Array<string> {
  let files: Array<string> = [];
  for (const file of args) {
    files = files.concat(glob.sync(file, {nosort: true}));
  }
  return files;
}

function loadFiles(input: Array<string>): Array<File> {
  let files: Array<File> = [];
  input.forEach((filename) => {
    files.push(new File(filename, fs.readFileSync(filename, "utf8")));
  } );
  return files;
}

function run() {
  let argv = minimist(process.argv.slice(2));
  let format = "default";
  let output = "";
  let issues: Array<Issue> = [];

  if (argv["f"] !== undefined || argv["format"] !== undefined) {
    if (argv["f"] !== undefined) {
      format = argv["f"];
    } else {
      format = argv["format"];
    }
  }

  if (argv["h"] !== undefined || argv["help"] !== undefined) {
    output = output + displayHelp();
  } else if (argv["v"] !== undefined || argv["version"] !== undefined) {
    output = output + Runner.version() + "\n";
  } else if (argv["d"] !== undefined || argv["default"] !== undefined) {
    output = output + JSON.stringify(Config.getDefault().get()) + "\n";
  } else if (argv._[0] === undefined) {
    output = output + "Supply filename\n";
  } else {
    let files = loadFileNames(argv._);

    if (files.length === 0) {
      output = output + "No files found\n";
    } else {
      let config = searchConfig(files[0]);

      if (argv["a"]) {
        config.setVersion(textToVersion(argv["a"]));
      }
      if (argv["s"]) {
        config.setShowProgress(true);
      }
      if (argv["m"] && os.cpus().length > 1) {
// multithreading currently only works with default config
        master(files);
      } else {
        issues = Runner.run(loadFiles(files), config);
        output = Runner.format(issues, format);
      }
    }
  }

  if (output.length > 0) {
    sendOutput(output, issues);
  }
}

function sendOutput(output, issues) {
  process.stdout.write(output, () => {
    if (issues.length > 0) {
      process.exit(1);
    }
  });
}

function master(files: Array<string>): void {
  let parsed: Array<ParsedFile> = [];
  let count = 0;

  let bar = new ProgressBar(":percent - Lexing and parsing",
                            {total: files.length});

  for (let i = 0; i < os.cpus().length; i++) {
    if (files.length > 0) {
      cluster.fork().send(files.pop());
      count = count + 1;
      bar.tick();
      bar.render();
    }
  }

  cluster.on("message", function(work, msg) {
//    console.log("master, message received from worker");
    parsed = parsed.concat(msg);
    if (files.length > 0) {
      work.send(files.pop());
      bar.tick();
      bar.render();
    } else {
      work.kill();
    }
  });

  cluster.on("exit", function() {
    count = count - 1;
    if (count === 0) {
      console.log("all workers exited");
    }
  });
}

function worker() {
  process.on("message", function(filename) {
//    let res =
    Runner.parse(loadFiles([filename]));
// todo, return result to master thread
    process.send([]);
  });
}

if (cluster.isMaster) {
  run();
} else {
  worker();
}