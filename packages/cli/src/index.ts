import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as ProgressBar from "progress";
import * as childProcess from "child_process";
import * as JSON5 from "json5";
import {Issue, IProgress, IFile, Position, Config, Registry, Version, MemoryFile, IRegistry} from "@abaplint/core";
import {Formatter} from "./formatters/_format";
import {FileOperations} from "./file_operations";
import {ApackDependencyProvider} from "./apack_dependency_provider";
import {ApplyFixes} from "./fixes";
import {Rename} from "./rename";

export const GENERIC_ERROR = "generic_error";

class Progress implements IProgress {
  private bar: ProgressBar;

  public set(total: number, _text: string) {
    this.bar = new ProgressBar(":percent - :elapseds - :text", {total, renderThrottle: 100});
  }

  public async tick(text: string) {
    this.bar.tick({text});
    this.bar.render();
  }

  public tickSync(text: string) {
    this.bar.tick({text});
    this.bar.render();
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
      f = process.cwd() + path.sep + "abaplint.jsonc";
    }
    if (fs.existsSync(f) === false) {
      f = process.cwd() + path.sep + "abaplint.json5";
    }
    if (fs.existsSync(f) === false) {
      process.stderr.write("Using default config\n");
      return {config: Config.getDefault(), base: "."};
    }
  } else {
    if (fs.existsSync(filename) === false) {
      process.stderr.write("ERROR: Specified abaplint configuration file does not exist, using default config\n");
      return {config: Config.getDefault(), base: "."};
    } else if (fs.statSync(filename).isDirectory() === true) {
      process.stderr.write("Supply filename, not directory, using default config\n");
      return {config: Config.getDefault(), base: "."};
    }
    f = filename;
  }

  // evil hack to get JSON5 working
  if (JSON5.parse === undefined) {
    // @ts-ignore
    JSON5.parse = JSON5.default.parse;
  }

  process.stderr.write("Using config: " + f + "\n");
  const json = fs.readFileSync(f, "utf8");
  const parsed = JSON5.parse(json);
  const vers: any = Version;
  if (Object.keys(Version).some(v => vers[v] === parsed.syntax.version) === false) {
    throw "Error: Unknown version in abaplint.json";
  }

  return {
    config: new Config(json),
    base: path.dirname(f) === process.cwd() ? "." : path.dirname(f),
  };
}

async function loadDependencies(config: Config, compress: boolean | undefined, bar: IProgress, base: string): Promise<IFile[]> {
  let files: IFile[] = [];

  const deps = config.get().dependencies || [];

  const useApack = config.get().global.useApackDependencies;
  if (useApack) {
    const apackPath = path.join(base, ".apack-manifest.xml");
    if (fs.existsSync(apackPath)) {
      const apackManifest = fs.readFileSync(apackPath, "utf8");
      deps.push(...ApackDependencyProvider.fromManifest(apackManifest));
    }
  }

  if (!deps) {
    return [];
  }

  for (const d of deps) {
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

export type Arguments = {
  configFilename?: string,
  format: string,
  compress?: boolean,
  parsingPerformance?: boolean,
  showHelp?: boolean,
  showVersion?: boolean,
  outputDefaultConfig?: boolean,
  runFix?: boolean,
  runRename?: boolean,
  outFormat?: string,
  outFile?: string,
};

function displayHelp(): string {
  // follow https://docopt.org conventions,
  return "Usage:\n" +
    "  abaplint [<abaplint.json> -f <format> -c --outformat <format> --outfile <file> --fix] \n" +
    "  abaplint -h | --help      show this help\n" +
    "  abaplint -v | --version   show version\n" +
    "  abaplint -d | --default   show default configuration\n" +
    "\n" +
    "Options:\n" +
    "  -f, --format <format>  output format (standard, total, json, summary, junit, codeframe, checkstyle)\n" +
    "  --outformat <format>   output format, use in combination with outfile\n" +
    "  --outfile <file>       output issues to file in format\n" +
    "  --fix                  apply quick fixes to files\n" +
    "  --rename               rename object according to rules in abaplint.json\n" +
    "  -p                     output performance information\n" +
    "  -c                     compress files in memory\n";
}

function out(issues: Issue[], length: number, arg: Arguments): string {
  const output = Formatter.format(issues, arg.format, length);
  if (arg.outFormat && arg.outFile) {
    const fileContents = Formatter.format(issues, arg.outFormat, length);
    fs.writeFileSync(arg.outFile, fileContents, "utf-8");
  }
  return output;
}

export async function run(arg: Arguments) {

  // evil hack to get JSON5 working
  if (JSON5.parse === undefined) {
    // @ts-ignore
    JSON5.parse = JSON5.default.parse;
  }
  if (JSON5.stringify === undefined) {
    // @ts-ignore
    JSON5.stringify = JSON5.default.stringify;
  }

  let output = "";
  let issues: Issue[] = [];
  let reg: IRegistry | undefined = undefined;

  const progress: IProgress = new Progress();

  if (arg.showHelp === true) {
    output = output + displayHelp();
  } else if (arg.showVersion === true) {
    output = output + Registry.abaplintVersion() + "\n";
  } else if (arg.outputDefaultConfig === true) {
    output = output + JSON.stringify(Config.getDefault().get(), undefined, 2) + "\n";
  } else {
    process.stderr.write("abaplint " + Registry.abaplintVersion() + "\n");

    let loaded: IFile[] = [];
    let deps: IFile[] = [];
    const {config, base} = loadConfig(arg.configFilename);
    try {
      if (config.get().global.files === undefined) {
        throw "Error: Update abaplint configuration file to latest format";
      }
      const files = FileOperations.loadFileNames(base + config.get().global.files);
      loaded = await FileOperations.loadFiles(arg.compress, files, progress);
      deps = await loadDependencies(config, arg.compress, progress, base);

      reg = new Registry(config);
      reg.addDependencies(deps);
      reg.addFiles(loaded); // if the object exists in repo, it should take precedence over deps
      await reg.parseAsync({progress, outputPerformance: arg.parsingPerformance});
      if (arg.runFix !== true) {
        issues = issues.concat(reg.findIssues({progress, outputPerformance: arg.parsingPerformance}));
      }
    } catch (error) {
      const file = new MemoryFile("generic", "dummy");
      const message = error.toString() + " " + error.stack?.split("\n")[1]?.trim();
      const issue = Issue.atPosition(file, new Position(1, 1), message, GENERIC_ERROR);
      issues = [issue];
    }

    let extra = "";
    if (arg.runFix === true && reg) {
      await new ApplyFixes().applyFixes(reg, fs);
      issues = [...reg.findIssues()]; // used in exercism ABAP test runner
      extra = "Fixes applied";
    } else if (arg.runRename === true && reg) {
      if (issues.length === 0) {
        new Rename(reg).run(config.get(), base, fs);
        extra = "Renames applied";
      } else {
        extra = "Renames NOT applied, issues found";
      }
    }

    output = out(issues, loaded.length, arg) + extra;
  }

  return {output, issues, reg};
}