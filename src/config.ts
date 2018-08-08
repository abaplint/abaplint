import * as Rules from "./rules/";
import {Version, versionToText, textToVersion} from "./version";

export default class Config {

  private static defaultVersion = Version.v750;

  private config = undefined;
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

    let json = "{\"version\": \"" +
      versionToText(Config.defaultVersion) +
      "\", \"rules\":\n{" + defaults.join(",\n") + "\n}}";
    let conf = new Config(json);
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
    if (this.config["version"] === undefined) {
      return Config.defaultVersion;
    }
    return textToVersion(this.config["version"]);
  }

  public setVersion(ver: Version): Config {
    this.config["version"] = versionToText(ver);
    return this;
  }

  public getShowProgress(): boolean {
    return this.progress;
  }

  public setShowProgress(s: boolean) {
    this.progress = s;
  }
}