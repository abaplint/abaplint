import {Version, versionToText, textToVersion} from "./version";
import {Artifacts} from "./artifacts";
import {IRule} from "./rules/_irule";

export interface IGlobalConfig {
  files: string;
  skipGeneratedGatewayClasses: boolean;
  skipGeneratedPersistentClasses: boolean;
  skipGeneratedFunctionGroups: boolean;
  applyUnspecifiedRules: boolean;
}

export interface IDependency {
  url?: string;
  folder?: string;
  files: string;
}

export interface ISyntaxSettings {
  version: string;
  errorNamespace: string;
  globalConstants: string[];
  globalMacros: string[];
}

export interface IConfig {
  global: IGlobalConfig;
  dependencies: IDependency[];
  syntax: ISyntaxSettings;
  rules: any;
}

export class Config {

  private static defaultVersion = Version.v755;
  private config: IConfig;

  public static getDefault(): Config {
    const rules: any = {};

    const sorted = Artifacts.getRules().sort((a, b) => { return a.getKey().localeCompare(b.getKey()); });
    for (const rule of sorted) {
      rules[rule.getKey()] = rule.getConfig();
    }

    const config: IConfig = {
      global: {
        files: "/src/**/*.*",
        skipGeneratedGatewayClasses: true,
        skipGeneratedPersistentClasses: true,
        skipGeneratedFunctionGroups: true,
        applyUnspecifiedRules: true,
      },
      dependencies: [{
        url: "https://github.com/abaplint/deps",
        folder: "/deps",
        files: "/src/**/*.*",
      }],
      syntax: {
        version: versionToText(Config.defaultVersion),
        errorNamespace: "^(Z|Y)",
        globalConstants: [],
        globalMacros: [],
      },
      rules: rules,
    };

    return new Config(JSON.stringify(config));
  }

  public getEnabledRules(): IRule[] {
    const rules: IRule[] = [];
    for (const rule of Artifacts.getRules()) {
      const ruleExists = this.config["rules"][rule.getKey()] !== undefined;
      if (!ruleExists && this.config.global.applyUnspecifiedRules) {
        rules.push(rule);
        continue;
      }

      if (ruleExists) {
        const ruleEnabled = this.readByKey(rule.getKey(), "enabled");
        if (ruleEnabled === true || ruleEnabled === undefined) {
          rules.push(rule);
          continue;
        }
      }
    }

    return rules;
  }
  public constructor(json: string) {
    this.config = JSON.parse(json);

    if (this.config.global === undefined) {
      this.config.global = Config.getDefault().getGlobal();
    }
    if (this.config.syntax === undefined) {
      this.config.syntax = Config.getDefault().getSyntaxSetttings();
    }
  }

  public get() {
    return this.config;
  }

  public readByKey(rule: string, key: string) {
    return this.config["rules"][rule] ? this.config["rules"][rule][key] : undefined;
  }

  public readByRule(rule: string) {
    return this.config["rules"][rule];
  }

  public getGlobal(): IGlobalConfig {
    return this.config.global;
  }

  public getSyntaxSetttings(): ISyntaxSettings {
    return this.config.syntax;
  }

  public getVersion(): Version {
    if (this.config.global === undefined || this.config.syntax.version === undefined) {
      return Config.defaultVersion;
    }
    return textToVersion(this.config.syntax.version);
  }

  public setVersion(ver: Version | undefined): Config {
    if (ver === undefined) {
      return this;
    }
    this.config.syntax.version = versionToText(ver);
    return this;
  }

}