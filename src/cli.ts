import Runner from "./runner";
import {IFile, CompressedFile, MemoryFile} from "./files";
import {Issue} from "./issue";
import Config from "./config";
import {textToVersion} from "./version";
import {Formatter} from "./formatters";
import * as fs from "fs";
import * as path from "path";
import * as zlib from "zlib";
import * as glob from "glob";
import * as minimist from "minimist";
import {Artifacts} from "./abap/artifacts";
import Registry, {IProgress} from "./registry";
import * as ProgressBar from "progress";

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
  output = output + "  -k               output keywords\n";
  output = output + "  -c               compress files in memory\n";
  output = output + "  -m               show memory usage\n";
  output = output + "  -d, --default    show default configuration\n";
  return output;
}

function loadFileNames(args: string[]): Array<string> {
  let files: Array<string> = [];
  for (const file of args) {
    files = files.concat(glob.sync(file, {nosort: true, nodir: true}));
  }
  return files;
}

async function loadFiles(compress: boolean, input: Array<string>, progress: boolean): Promise<Array<IFile>> {
  let files: Array<IFile> = [];
  let bar: ProgressBar = undefined;

  if (progress) {
    bar = new ProgressBar(":percent - Reading files - :filename", {total: input.length});
  }

  for (const filename of input) {
// note that readFileSync is typically faster than async readFile,
// https://medium.com/@adamhooper/node-synchronous-code-runs-faster-than-asynchronous-code-b0553d5cf54e
    const raw = fs.readFileSync(filename, "utf8").replace(/\r/g, ""); // ignore all carriage returns
    // tslint:disable-next-line:no-constant-condition
    if (compress) {
// todo, util.promisify(zlib.deflate) does not seem to work?
      files.push(new CompressedFile(filename, zlib.deflateSync(raw).toString("base64")));
    } else {
      files.push(new MemoryFile(filename, raw));
    }

    if (bar) {
      bar.tick({filename: path.basename(filename)});
      bar.render();
    }
  }
  return files;
}

async function run() {
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
  } else if (argv["k"] !== undefined) {
    output = output + JSON.stringify(Artifacts.getKeywords(), undefined, 2);
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
      let compress = argv["c"] ? true : false;

      let loaded = await loadFiles(compress, files, argv["s"]);
      let progress = argv["s"] ? new Progress() : undefined;
      issues = new Registry(config).addFiles(loaded).findIssues(progress);
      output = Formatter.format(issues, format);
    }
  }

  if (argv["m"]) {
    output = output + JSON.stringify(process.memoryUsage());
  }

  return {output, issues};
}

run().then(({output, issues}) => {
  if (output.length > 0) {
    process.stdout.write(output, () => {
      if (issues.length > 0) {
        process.exit(1);
      }
    });
  }
  process.exit();
}).catch((err) => {
  console.dir(err);
  process.exit(1);
});

class Progress implements IProgress {
  private bar: ProgressBar = undefined;

  public set(total: number, text: string) {
    this.bar = new ProgressBar(text, {total});
  }

  public tick(options: any) {
    if (this.bar) {
      this.bar.tick(options);
      this.bar.render();
    }
  }
}