import File from "./file";
import Config from "./config";
import * as Rules from "./rules/";
import Lexer from "./lexer";
import Parser from "./parser";

export default class Runner {
  private static conf: Config;

  public static run(files: Array<File>) {
    this.conf = new Config(files[0].getFilename());
    this.prioritizeFiles(files).forEach((o) => { this.analyze(o); });
  }

  private static prioritizeFiles(files: Array<File>): Array<File> {
    let order: Array<File> = [];

    files.forEach((file) => { if (/\.type\.abap$/.test(file.getFilename())) { order.push(file); } });
    files.forEach((file) => { if (order.indexOf(file) === -1 ) { order.push(file); } });

    return order;
  }

  private static analyze(file: File) {
    file.setTokens(Lexer.run(file));
    file.setStatements(Parser.run(file));

    for (let key in Rules) {
      let rule = new Rules[key]();
      if (rule.get_key && this.conf.readByKey(rule.get_key(), "enabled") === true) {
        rule.set_config(this.conf.readByRule(rule.get_key()));
        rule.run(file);
      }
    }
  }
}