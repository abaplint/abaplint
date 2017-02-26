import * as Rules from "./rules/";
import {Version} from "./version";

export default class Config {

  private config = undefined;
  private ver: Version;
  private progress: boolean;

  public static getDefault(): Config {
    let defaults: Array<string> = [];

    for (let key in Rules) {
      if (typeof Rules[key] === "function") {
        let rule: Rules.IRule = new Rules[key]();
        if (rule.getKey) {
          defaults.push("\"" + rule.getKey() + "\": " + JSON.stringify(rule.getConfig()));
        }
      }
    }

    let json = "{\"rules\":\n{" + defaults.join(",\n") + "\n}}";
    let conf = new Config(json);
    conf.setVersion(Version.v750);
    return conf;
  }

  public constructor(json: string) {
    this.config = JSON.parse(json);
  }

  public get() {
    return this.config;
  }

  public readByKey(rule: string, key: string) {
// todo: when reading enabled for a rule that is not in abaplint.json
//       should the rule be enabled by default?
    return this.config["rules"][rule] ? this.config["rules"][rule][key] : undefined;
  }

  public readByRule(rule: string) {
    return this.config["rules"][rule];
  }

  public getVersion(): Version {
    return this.ver;
  }

  public setVersion(ver: Version): Config {
    this.ver = ver;
    return this;
  }

  public getShowProgress(): boolean {
    return this.progress;
  }

  public setShowProgress(s: boolean) {
    this.progress = s;
  }
}