import {IFile, MemoryFile, ParsedFile} from "./files";
import Config from "./config";
import * as Rules from "./rules/";
import {Issue} from "./issue";
import Registry from "./registry";
import {Version, textToVersion} from "./version";
import {Formatter} from "./formatters/";
import * as ProgressBar from "progress";
import {GenericError} from "./rules/";
import Parser from "./abap/parser";

export default class Runner {
  private conf: Config;
  private reg: Registry;
  private parsed: boolean;
  private generic: Array<Issue>;

  public static version(): string {
    // magic, see build script "version.sh"
    return "{{ VERSION }}";
  }

  constructor(files: Array<IFile>, conf?: Config) {
    this.conf = conf ? conf : Config.getDefault();
    this.reg = new Registry();
    this.parsed = false;
    this.generic = [];

    this.addObjectsToRegistry(files);
  }

  public parse(): Array<ParsedFile> {
// todo, consider if this method should return anything, use reg instead for fetching stuff?
// return reg? only called from "/test"
    if (this.parsed === true) {
      return this.reg.getParsedFiles();
    }
    this.parseInternal();
    return this.reg.getParsedFiles();
  }

  public findIssues(): Array<Issue> {
    if (this.parsed === false) {
      this.parseInternal();
    }

    let issues: Array<Issue> = [];
    issues = this.generic.slice(0);

    let objects = this.reg.getObjects();

    let bar = new Progress(this.conf,
                           ":percent - Finding Issues - :object",
                           {total: objects.length});

    for (let obj of objects) {
      bar.tick({object: obj.getType() + " " + obj.getName()});

      for (let key in Rules) {
        const rul: any = Rules;
        if (typeof rul[key] === "function") {
          let rule: Rules.IRule = new rul[key]();
          if (rule.getKey && this.conf.readByKey(rule.getKey(), "enabled") === true) {
            rule.setConfig(this.conf.readByRule(rule.getKey()));
            issues = issues.concat(rule.run(obj, this.reg, this.conf.getVersion()));
          }
        }
      }
    }

    return issues;
  }

  private parseInternal(): void {
    let objects = this.reg.getABAPObjects();

    let bar = new Progress(this.conf,
                           ":percent - Lexing and parsing - :object",
                           {total: objects.length});

    objects.forEach((obj) => {
      bar.tick({object: obj.getType() + " " + obj.getName()});
      obj.parseFirstPass(this.conf.getVersion(), this.reg);
    });

    objects.forEach((obj) => {
      obj.parseSecondPass(this.reg);
    });

    bar = new Progress(this.conf,
                       ":percent - Adding structure - :object",
                       {total: objects.length});
    for (let obj of objects) {
      bar.tick({object: obj.getType() + " " + obj.getName()});
      for (let file of obj.getParsed()) {
        this.generic = this.generic.concat(Parser.runStructure(file));
      }
    }

    this.parsed = true;
  }

  private addObjectsToRegistry(files: Array<IFile>): void {
    files.forEach((f) => {
      try {
        this.reg.findOrCreate(f.getObjectName(), f.getObjectType()).addFile(f);
      } catch (error) {
// todo, this does not respect the configuration
        this.generic.push(new Issue(new GenericError(error), f, 1));
      }
    });
  }

}

// todo, implement this with events instead, so it works on both node and web
class Progress {

  private bar: ProgressBar = undefined;

  constructor(conf: Config, text: string, options: any) {
    if (conf.getShowProgress()) {
      this.bar = new ProgressBar(text, options);
    }
  }

  public tick(options: any) {
    if (this.bar) {
      this.bar.tick(options);
      this.bar.render();
    }
  }

}

// this part is required for the web things to work
exports.File = MemoryFile;
exports.Runner = Runner;
exports.Config = Config;
exports.Version = Version;
exports.textToVersion = textToVersion;
exports.Formatter = Formatter;