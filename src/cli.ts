import Runner from "./runner";
import {File, ParsedFile} from "./file";
import {Issue} from "./issue";
import Config from "./config";
import {versionText} from "./version";
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

function loadFiles(args): Array<File> {
  let files: Array<File> = [];
  for (const file of args) {
    glob.sync(file, {nosort: true}).forEach((filename) => {
      files.push(new File(filename, fs.readFileSync(filename, "utf8")));
    } );
  }
  return files;
}

function run() {
  let argv = minimist(process.argv.slice(2));
  let format = "default";
  let output = "";
  let files: Array<File> = [];
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
    files = loadFiles(argv._);

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
      if (argv["m"] && os.cpus().length > 1) {
// multithreading currently only works with default config
        issues = master(files);
      } else {
        issues = Runner.run(files, config);
      }
      output = Runner.format(issues, format);
    }
  }

  process.stdout.write(output, () => {
    if (issues.length > 0) {
      process.exit(1);
    }
  });
}


function master(files): Array<Issue> {
  let parsed: Array<ParsedFile> = [];

  let worker = cluster.fork();

  worker.on("message", function(msg) {
    console.log("master, message received from worker");
    parsed.push(msg);
  });
  worker.send(files[0]);

  cluster.on("exit", function() {
    // when the master has no more workers alive it
    // todo
  });

  return [];
}

function worker() {
  console.log("I am the thread:" + process.pid);
// todo
  process.on("message", function(file) {
//    console.dir(file);
    let f = new File(file.filename, file.raw);
    let res = Runner.parse([f])[0];
    console.dir(res.getTokens());
    console.dir(res.getStatements());
    console.dir(res.getStatements()[0].getChildren());
    console.dir(res.getRoot());
    process.send(res);
  });
}

if (cluster.isMaster) {
  run();
} else {
  worker();
}