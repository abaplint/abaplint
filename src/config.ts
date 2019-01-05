import {Version, versionToText, textToVersion} from "./version";
import {Artifacts} from "./artifacts";
import {IRule} from "./rules/_irule";

export interface IGlobalConfig {
  version: string;
  skipGeneratedGatewayClasses: boolean;
  skipGeneratedPersistentClasses: boolean;
  skipGeneratedFunctionGroups: boolean;
}

export interface IConfig {
  global: IGlobalConfig;
  rules: any;
}

export class Config {

  private static defaultVersion = Version.v753;
  private config: IConfig;

  public static getDefault(): Config {
    const defaults: string[] = [];

    for (const rule of Artifacts.getRules()) {
      defaults.push("\"" + rule.getKey() + "\": " + JSON.stringify(rule.getConfig()));
    }

    const global = this.getGlobalDefault();

// todo, use real object with index signature instead of "defaults"
    const json = "{" +
      "\"global\": " + JSON.stringify(global) + ", " +
      "\"rules\": {" + defaults.join(", ") + "}}";
    const conf = new Config(json);
    return conf;
  }

  private static getGlobalDefault(): IGlobalConfig {
    return {
      version: versionToText(Config.defaultVersion),
      skipGeneratedGatewayClasses: true,
      skipGeneratedPersistentClasses: true,
      skipGeneratedFunctionGroups: true,
    };
  }

  public getEnabledRules(): IRule[] {
    const rules: IRule[] = [];
    for (const rule of Artifacts.getRules()) {
      if (this.readByKey(rule.getKey(), "enabled") === true) {
        rule.setConfig(this.readByRule(rule.getKey()));
        rules.push(rule);
      }
    }
    return rules;
  }

  public constructor(json: string) {
    this.config = JSON.parse(json);

    if (this.config.global === undefined) {
      this.config.global = Config.getGlobalDefault();
    }
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

  public getGlobal(): IGlobalConfig {
    return this.config.global;
  }

  public getVersion(): Version {
    if (this.config.global === undefined || this.config.global.version === undefined) {
      return Config.defaultVersion;
    }
    return textToVersion(this.config.global.version);
  }

  public setVersion(ver: Version | undefined): Config {
    if (ver === undefined) {
      return this;
    }
    this.config.global.version = versionToText(ver);
    return this;
  }

}