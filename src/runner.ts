import {File, ParsedFile} from "./file";
import Config from "./config";
import * as Rules from "./rules/";
import Lexer from "./lexer";
import Parser from "./parser";
import {Issue} from "./issue";
import Nesting from "./nesting";
import {Version} from "./version";
import * as Types from "./types";
import * as Formatters from "./formatters/";

export default class Runner {

  public static run(files: Array<File>, conf?: Config): Array<Issue> {
    conf = conf ? conf : Config.getDefault();

    return this.issues(this.parse(files, conf), conf);
  }

  public static parse(files: Array<File>, conf?: Config): Array<ParsedFile> {
    let ret: Array<ParsedFile> = [];

    conf = conf ? conf : Config.getDefault();

    this.prioritizeFiles(files).forEach((f) => {
      if (conf.getShowProgress()) {
        console.log("Lexing and parsing: " + f.getFilename());
      }
      let tokens = Lexer.run(f);
      let statements = Parser.run(tokens, conf.getVersion());
      let root = Nesting.run(statements);

      ret.push(new ParsedFile(f.getFilename(), f.getRaw(), tokens, statements, root));
    });

    return ret;
  }

  public static issues(files: Array<ParsedFile>, conf: Config): Array<Issue> {
    let issues: Array<Issue> = [];

    for (let file of files) {
      for (let key in Rules) {
        let rule: Rules.IRule = new Rules[key]();
        if (rule.getKey && conf.readByKey(rule.getKey(), "enabled") === true) {
          rule.setConfig(conf.readByRule(rule.getKey()));
          issues = issues.concat(rule.run(file));
        }
      }
    }

    return issues;
  }

  public static version(): string {
// magic, see build script "version.sh"
    return "{{ VERSION }}";
  }

/*
  public static downport(files: Array<ParsedFile>): Array<File> {
    let ret = new File("result.abap", "todo sdf");
// todo, auto validate 702 code after downport?
    return [ret];
  }
*/

  public static types(file: ParsedFile) {
    return Types.Analyze.run(file);
  }

  public static format(issues: Array<Issue>, format?: string): string {
// todo, this can be done more generic
    switch (format) {
      case "total":
        return Formatters.Total.output(issues);
      case "json":
        return Formatters.Json.output(issues);
      default:
        return Formatters.Standard.output(issues);
    }
  }

  private static prioritizeFiles(files: Array<File>): Array<File> {
    let order: Array<File> = [];

// process TYPE-POOLS first
    files.forEach((file) => { if (/\.type\.abap$/i.test(file.getFilename())) { order.push(file); } });
    files.forEach((file) => { if (order.indexOf(file) === -1 ) { if (!this.skip(file)) { order.push(file); } } });

    return order;
  }

  private static skip(file: File): boolean {
// ignore global exception classes
    if (/zcx_.*\.clas\.abap$/.test(file.getFilename())) {
      return true;
    }
    return false;
  }

}

exports.File = File;
exports.Runner = Runner;
exports.Config = Config;
exports.Version = Version;