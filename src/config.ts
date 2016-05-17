import "../typings/index.d.ts";
import * as Rules from "./rules/";
import * as path from "path";
import * as fs from "fs";

export default class Config {

  private config = undefined;

  public static getDefault(): string {
    let defaults: Array<string> = [];

    for (let key in Rules) {
      let rule = new Rules[key]();
      if (rule.get_key) {
        defaults.push("\"" + rule.get_key() + "\": " + JSON.stringify(rule.get_config()));
      }
    }

    return "{\"rules\":\n{" + defaults.join(",\n") + "\n}}";
  }

  public constructor(filename: string) {
    this.searchConfig(path.dirname(process.cwd() + path.sep + filename) + path.sep);
    if (this.config === undefined) {
      this.set(Config.getDefault());
    }
  }

  public readByKey(rule: string, key: string) {
    return this.config["rules"][rule][key];
  }

  public readByRule(rule: string) {
    return this.config["rules"][rule];
  }

  public set(json: string) {
    this.config = JSON.parse(json);
  }

  private searchConfig(dir: string) {
    if (typeof fs.existsSync !== "function") {
// make sure the code also works in web browser
      return;
    }

    let file = dir + "abaplint.json";
    if (fs.existsSync(file)) {
      let json = fs.readFileSync(file, "utf8");
      this.set(json);
      return;
    }

    let up = path.normalize(dir + ".." + path.sep);
    if (path.normalize(up) !== dir) {
      this.searchConfig(up);
    }
  }
}