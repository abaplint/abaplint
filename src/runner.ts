import File from "./file";
import Config from "./config";
import * as Rules from "./rules/";
import Lexer from "./lexer";
import Parser from "./parser";
import Nesting from "./nesting";
import {Version} from "./version";
import * as Formatters from "./formatters/";

export default class Runner {
  private static conf: Config;
  private static ver: Version;

  public static run(files: Array<File>, ver = Version.v750) {
    this.ver = ver;
    this.conf = new Config(files[0].getFilename());
    this.prioritizeFiles(files).forEach((o) => { this.analyze(o); });
  }

  public static format(files: Array<File>, format: string): string {
    let output = "";
// todo, this can be done more generic
    switch (format) {
      case "total":
        output = Formatters.Total.output(files);
        break;
      case "summary":
        output = Formatters.Summary.output(files);
        break;
      case "json":
        output = Formatters.Json.output(files);
        break;
      default:
        output = Formatters.Standard.output(files);
        break;
    }
    return output;
  }

  private static prioritizeFiles(files: Array<File>): Array<File> {
    let order: Array<File> = [];

    files.forEach((file) => { if (/\.type\.abap$/.test(file.getFilename())) { order.push(file); } });
    files.forEach((file) => { if (order.indexOf(file) === -1 ) { order.push(file); } });

    return order;
  }

  private static analyze(file: File) {
    file.setTokens(Lexer.run(file));
    file.setStatements(Parser.run(file, this.ver));
    file.setNesting(Nesting.run(file));

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