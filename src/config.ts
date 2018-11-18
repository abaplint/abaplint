import * as Rules from "./rules/";
import {Version, versionToText, textToVersion} from "./version";
import {IRule} from "./rules/_irule";

export class Config {

  private static defaultVersion = Version.v753;

  private config: any = undefined;

  public static getDefault(): Config {
    const defaults: Array<string> = [];

    for (const key in Rules) {
      const rul: any = Rules;
      if (typeof rul[key] === "function") {
        const rule: IRule = new rul[key]();
        if (rule.getKey) {
          defaults.push("\"" + rule.getKey() + "\": " + JSON.stringify(rule.getConfig()));
        }
      }
    }

    const json = "{\"version\": \"" +
      versionToText(Config.defaultVersion) +
      "\", \"rules\":\n{" + defaults.join(",\n") + "\n}}";
    const conf = new Config(json);
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

  public setVersion(ver: Version | undefined): Config {
    if (ver === undefined) {
      return this;
    }
    this.config["version"] = versionToText(ver);
    return this;
  }

}