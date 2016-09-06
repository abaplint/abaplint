import {File} from "./file";
import Config from "./config";
import * as Rules from "./rules/";
import Lexer from "./lexer";
import Parser from "./parser";
import Nesting from "./nesting";
import {Version} from "./version";
import * as Types from "./types";
import * as Formatters from "./formatters/";

export default class Runner {
  private static conf: Config;

  public static run(files: Array<File>, conf?: Config) {
    this.conf = conf ? conf : Config.getDefault();
    this.prioritizeFiles(files).forEach((o) => { this.analyze(o); });
  }

  public static version(): string {
// magic, see build script
    return "{{ VERSION }}";
  }

  public static downport(file: File): File {
    let ret = new File("result.abap", "todo sdf");
// todo, auto validate 702 code after downport?
    return ret;
  }

  public static types(file: File) {
    return Types.Analyze.run(file);
  }

  public static format(files: Array<File>, format?: string): string {
// todo, this can be done more generic
    switch (format) {
      case "total":
        return Formatters.Total.output(files);
      case "summary":
        return Formatters.Summary.output(files);
      case "json":
        return Formatters.Json.output(files);
      default:
        return Formatters.Standard.output(files);
    }
  }

  private static prioritizeFiles(files: Array<File>): Array<File> {
    let order: Array<File> = [];

    files.forEach((file) => { if (/\.type\.abap$/.test(file.getFilename())) { order.push(file); } });
    files.forEach((file) => { if (order.indexOf(file) === -1 ) { order.push(file); } });

    return order;
  }

  private static analyze(file: File) {
    file.setTokens(Lexer.run(file));
    file.setStatements(Parser.run(file, this.conf.getVersion()));
    file.setRoot(Nesting.run(file));

    for (let key in Rules) {
      let rule: Rules.IRule = new Rules[key]();
      if (rule.getKey && this.conf.readByKey(rule.getKey(), "enabled") === true) {
        rule.setConfig(this.conf.readByRule(rule.getKey()));
        rule.run(file);
      }
    }
  }
}

exports.File = File;
exports.Runner = Runner;
exports.Config = Config;
exports.Version = Version;