import * as fs from "fs";
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

function loadConfig(filename: string| undefined): Config {
  if (filename === undefined) {
    process.stderr.write("Using default config\n");
    return Config.getDefault();
  } else {
    process.stderr.write("Using config: " + filename + "\n");
    const json = fs.readFileSync(filename, "utf8");
    return new Config(json);
  }
}

function findConfig(dir: string): string | undefined {
  const file = dir + "abaplint.json";
  if (fs.existsSync(file)) {
    return file;
  }

  const up = path.normalize(dir + ".." + path.sep);
  if (path.normalize(up) !== dir) {
    return findConfig(up);
  }

  return undefined;
}

async function loadDependencies(config: Config, compress: boolean, bar: IProgress, configFile: string | undefined): Promise<IFile[]> {
  let files: IFile[] = [];

  if (config.get().dependencies === undefined) {
    return [];
  }

  for (const d of config.get().dependencies) {
    if (d.folder && configFile) {
      const g = path.dirname(configFile) + d.folder + d.files;
      const names = FileOperations.loadFileNames([g], false);
      if (names.length > 0) {
        process.stderr.write("Using dependencies from: " + g + "\n");
        files = files.concat(await FileOperations.loadFiles(compress, names, bar));
        continue;
      }
    }

    if (d.url) {
      process.stderr.write("Clone: " + d.url + "\n");
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), "abaplint-"));
      childProcess.execSync("git clone --quiet --depth 1 " + d.url + " .", {cwd: dir, stdio: "inherit"});
      const names = FileOperations.loadFileNames([dir + d.files]);
      files = files.concat(await FileOperations.loadFiles(compress, names, bar));
      FileOperations.deleteFolderRecursive(dir);
    }
  }

  return files;
}

function displayHelp(): string {
// follow docopt.org conventions,
  return "Usage:\n" +
    "  abaplint <file>... [-f <format> -c --outformat <format> --outfile <file>] \n" +
    "  abaplint -h | --help       show this help\n" +
    "  abaplint -v | --version    show version\n" +
    "  abaplint -d | --default    show default configuration\n" +
    "  abaplint <file>... -u [-c] show class and interface information\n" +
    "  abaplint <file>... -t [-c] show stats\n" +
    "  abaplint <file>... -e [-c] show semantic search information\n" +
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
    const files = FileOperations.loadFileNames(argv._);
    const configFile = findConfig(path.dirname(process.cwd() + path.sep + files[0]) + path.sep);
    const config = loadConfig(configFile);
    const deps = await loadDependencies(config, compress, progress, configFile);
    const loaded = await FileOperations.loadFiles(compress, files, progress);
    const reg = new Registry(config).addFiles(loaded);

    if (argv["t"]) {
      output = JSON.stringify(new Stats(reg).run(progress), undefined, 2);
    } else if (argv["u"]) {
      reg.parse(progress);
      output = JSON.stringify(new Dump(reg).classes(), undefined, 2);
    } else if (argv["e"]) {
      output = JSON.stringify(new SemanticSearch(reg).run(progress), undefined, 1);
    } else {
      reg.addDependencies(deps);

      issues = reg.findIssues(progress);
      output = Formatter.format(issues, format, loaded.length);

      if (argv["outformat"] && argv["outfile"]) {
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