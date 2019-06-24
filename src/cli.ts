import * as fs from "fs";
import * as path from "path";
import * as zlib from "zlib";
import * as glob from "glob";
import * as minimist from "minimist";
import * as ProgressBar from "progress";
import {CompressedFile, MemoryFile} from "./files";
import {Issue} from "./issue";
import {Config} from "./config";
import {textToVersion} from "./version";
import {Formatter} from "./formatters/_format";
import {Artifacts} from "./abap/artifacts";
import {Registry, IProgress, NoProgress} from "./registry";
import {IFile} from "./files/_ifile";
import {Stats} from "./stats/stats";
import {Dump} from "./dump/dump";

class Progress implements IProgress {
  private bar: ProgressBar;

  public set(total: number, text: string) {
    this.bar = new ProgressBar(text, {total, renderThrottle: 100});
  }

  public tick(options: any) {
    if (this.bar) {
      this.bar.tick(options);
      this.bar.render();
    }
  }
}

function searchConfig(filename: string): Config {
  const json = searchUp(path.dirname(process.cwd() + path.sep + filename) + path.sep);
  if (json === undefined) {
    return Config.getDefault();
  } else {
    return new Config(json);
  }
}

function searchUp(dir: string): string | undefined {
  const file = dir + "abaplint.json";
  if (fs.existsSync(file)) {
    return fs.readFileSync(file, "utf8");
  }

  const up = path.normalize(dir + ".." + path.sep);
  if (path.normalize(up) !== dir) {
    return searchUp(up);
  }

  return undefined;
}

function loadFileNames(args: string[]): string[] {
  let files: string[] = [];
  for (const file of args) {
    files = files.concat(glob.sync(file, {nosort: true, nodir: true}));
  }
  return files;
}

async function loadFiles(compress: boolean, input: string[], bar: IProgress): Promise<IFile[]> {
  const files: IFile[] = [];

  bar.set(input.length, ":percent - :elapseds - Reading files - :filename");

  for (const filename of input) {
    bar.tick({filename: path.basename(filename)});

    const base = filename.split("/").reverse()[0];
    if (base.split(".").length <= 2) {
      continue; // not a abapGit file
    }

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
  }
  return files;
}

function displayHelp(): string {
// follow docopt.org conventions,
  let output = "";
  output = output + "Usage:\n";
  output = output + "  abaplint <file>... [-f <format> -a <version> -s -c --outformat <format> --outfile <file>] \n";
  output = output + "  abaplint -h | --help       show this help\n";
  output = output + "  abaplint -v | --version    show version\n";
  output = output + "  abaplint -d | --default    show default configuration\n";
  output = output + "  abaplint -k                show keywords\n";
  output = output + "  abaplint <file>... -u [-s] show class and interface information\n";
  output = output + "  abaplint <file>... -t [-s] show stats\n";
  output = output + "\n";
  output = output + "Options:\n";
  output = output + "  -f, --format <format>  output format (standard, total, json, summary, junit, codeclimate)\n";
  output = output + "  -a <version>           specify ABAP version (v700, v702, ..., v740sp02, ..., cloud)\n";
  output = output + "  --outformat <format> --outfile <file>     output issues to file in format\n";
  output = output + "  -s                     show progress\n";
  output = output + "  -c                     compress files in memory\n";
  return output;
}

async function run() {

  const argv = minimist(process.argv.slice(2), {boolean: ["s", "c"]});
  let format = "standard";
  let output = "";
  let issues: Issue[] = [];

  if (argv["f"] !== undefined || argv["format"] !== undefined) {
    format = argv["f"] ? argv["f"] : argv["format"];
  }

  const progress: IProgress = argv["s"] ? new Progress() : new NoProgress();
  const compress = argv["c"] ? true : false;

  if (argv["h"] !== undefined || argv["help"] !== undefined) {
    output = output + displayHelp();
  } else if (argv["v"] !== undefined || argv["version"] !== undefined) {
    output = output + Registry.abaplintVersion() + "\n";
  } else if (argv["d"] !== undefined || argv["default"] !== undefined) {
    output = output + JSON.stringify(Config.getDefault().get(), undefined, 2) + "\n";
  } else if (argv["k"] !== undefined) {
    output = output + JSON.stringify(Artifacts.getKeywords(), undefined, 2);
  } else if (argv._[0] === undefined) {
    output = output + "Supply filename\n";
  } else {
    const files = loadFileNames(argv._);

    if (files.length === 0) {
      output = output + "No files found\n";
    } else {
      const config = searchConfig(files[0]);

      if (argv["a"]) {
        config.setVersion(textToVersion(argv["a"]));
      }

      const loaded = await loadFiles(compress, files, progress);
      const reg = new Registry(config);

      issues = reg.addFiles(loaded).findIssues(progress);
      output = Formatter.format(issues, format, loaded.length);

      if (argv["t"]) {
        output = JSON.stringify(new Stats(reg).run(progress), undefined, 2);
        issues = [];
      } else if (argv["u"]) {
        output = JSON.stringify(new Dump(reg).classes(), undefined, 2);
        issues = [];
      } else if (argv["outformat"] && argv["outfile"]) {
        const fileContents = Formatter.format(issues, argv["outformat"], loaded.length);
        fs.writeFileSync(argv["outfile"], fileContents, "utf-8");
      }
    }
  }

  return {output, issues};
}

run().then(({output, issues}) => {
  if (output.length > 0) {
    process.stdout.write(output, () => {
      if (issues.length > 0) {
        process.exit(1);
      } else {
        process.exit();
      }
    });
  } else {
    process.exit();
  }
}).catch((err) => {
  console.dir(err);
  process.exit(1);
});