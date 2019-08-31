mport * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as minimist from "minimist";
import * as ProgressBar from "progress";
import * as childProcess from "child_process";
import {Issue} from "../issue";
import {Config} from "../config";
import {Formatter} from "../formatters/_format";
import {Registry, IProgress} from "../registry";
import {IFile} from "../files/_ifile";
import {Stats} from "../extras/stats/stats";
import {Dump} from "../extras/dump/dump";
import {SemanticSearch} from "../extras/semantic_search/semantic_search";
import {FileOperations} from "./file_operations";
import {MemoryFile} from "../files";
import {Moose} from "../extras/moose/moose";

// todo, split this file into mulitple files? and move to new directory?

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

function loadConfig(filename: string | undefined): {config: Config, base: string} {
// possible cases:
// a) nothing specified, using abaplint.json from cwd
// b) nothing specified, no abaplint.json in cwd
// c) specified and found
// d) specified and not found => use default
// e) supplied but a directory => use default
  let f: string = "";
  if (filename === undefined) {
    f = process.cwd() + path.sep + "abaplint.json";
    if (fs.existsSync(f) === false) {
      process.stderr.write("Using default config\n");
      return {config: Config.getDefault(), base: "."};
    }
  } else {
    if (fs.existsSync(filename) === false) {
      process.stderr.write("Specified abaplint.json does not exist, using default config\n");
      return {config: Config.getDefault(), base: "."};
    } else if (fs.statSync(filename).isDirectory() === true) {
      process.stderr.write("Supply filename, not directory, using default config\n");
      return {config: Config.getDefault(), base: "."};
    }
    f = filename;
  }

  process.stderr.write("Using config: " + f + "\n");
  const json = fs.readFileSync(f, "utf8");
  return {config: new Config(json), base: path.dirname(f)};
}

async function loadDependencies(config: Config, compress: boolean, bar: IProgress, base: string): Promise<IFile[]> {
  let files: IFile[] = [];

  if (config.get().dependencies === undefined) {
    return [];
  }

  for (const d of config.get().dependencies) {
    if (d.folder) {
      const g = base + d.folder + d.files;
      const names = FileOperations.loadFileNames(g, false);
      if (names.length > 0) {
        process.stderr.write("Using dependency from: " + g + "\n");
        files = files.concat(await FileOperations.loadFiles(compress, names, bar));
        continue;
      }
    }

    if (d.url) {
      process.stderr.write("Clone: " + d.url + "\n");
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), "abaplint-"));
      childProcess.execSync("git clone --quiet --depth 1 " + d.url + " .", {cwd: dir, stdio: "inherit"});
      const names = FileOperations.loadFileNames(dir + d.files);
      files = files.concat(await FileOperations.loadFiles(compress, names, bar));
      FileOperations.deleteFolderRecursive(dir);
    }
  }

  return files;
}

function displayHelp(): string {
// follow docopt.org conventions,
  return "Usage:\n" +
    "  abaplint [<abaplint.json> -f <format> -c --outformat <format> --outfile <file>] \n" +
    "  abaplint -h | --help             show this help\n" +
    "  abaplint -v | --version          show version\n" +
    "  abaplint -d | --default          show default configuration\n" +
    "  abaplint -u [<abaplint.json> -c] show class and interface information\n" +
    "  abaplint -t [<abaplint.json> -c] show stats\n" +
    "  abaplint -e [<abaplint.json> -c] show semantic search information\n" +
    "  abaplint -m [<abaplint.json> -c] show moose information for software analysis and visualisation\n" +
    "\n" +
    "Options:\n" +
    "  -f, --format <format>  output format (standard, total, json, summary, junit, codeclimate)\n" +
    "  --outformat <format>   output format, use in combination with outfile\n" +
    "  --outfile <file>       output issues to file in format\n" +
    "  -c                     compress files in memory\n";
}

async function run() {

  const argv = minimist(process.argv.slice(2), {boolean: ["c", "u", "t", "e"]});
  let format = "standard";
  let output = "";
  let issues: Issue[] = [];

  if (argv["f"] !== undefined || argv["format"] !== undefined) {
    format = argv["f"] ? argv["f"] : argv["format"];
  }

  const progress: IProgress = new Progress();
  const compress = argv["c"] ? true : false;

  if (argv["h"] !== undefined || argv["help"] !== undefined) {
    output = output + displayHelp();
  } else if (argv["v"] !== undefined || argv["version"] !== undefined) {
    output = output + Registry.abaplintVersion() + "\n";
  } else if (argv["d"] !== undefined || argv["default"] !== undefined) {
    output = output + JSON.stringify(Config.getDefault().get(), undefined, 2) + "\n";
  } else {

    let loaded: IFile[] = [];
    let deps: IFile[] = [];
    const {config, base} = loadConfig(argv._[0]);
    try {
      if (config.get().global.files === undefined) {
        throw "Error: Update abaplint.json to latest format";
      }
      const files = FileOperations.loadFileNames(base + config.get().global.files);
      loaded = await FileOperations.loadFiles(compress, files, progress);
      deps = await loadDependencies(config, compress, progress, base);
    } catch (error) {
      issues = [new Issue({
        file: new MemoryFile("generic", ""),
        message: error,
        key: "error",
      })];
    }

    if (issues.length === 0) {
      const reg = new Registry(config).addFiles(loaded);
      if (argv["t"]) {
        output = JSON.stringify(new Stats(reg).run(progress), undefined, 2);
      } else if (argv["u"]) {
        reg.parse(progress);
        output = JSON.stringify(new Dump(reg).classes(), undefined, 2);
      } else if (argv["e"]) {
        output = JSON.stringify(new SemanticSearch(reg).run(progress), undefined, 1);
      } else if (argv["m"]) {
        output = new Moose(reg).getMSE();
        if (argv["outfile"]) {
          fs.writeFileSync(argv["outfile"], output, "utf-8");
        }
      } else {
        reg.addDependencies(deps);
        issues = reg.findIssues(progress);
        output = Formatter.format(issues, format, loaded.length);

        if (argv["outformat"] && argv["outfile"]) {
          const fileContents = Formatter.format(issues, argv["outformat"], loaded.length);
          fs.writeFileSync(argv["outfile"], fileContents, "utf-8");
        }
      }
    } else {
      output = Formatter.format(issues, format, loaded.length);
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
  console.log(err);
  process.exit(1);
});