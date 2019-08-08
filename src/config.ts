import {Version, versionToText, textToVersion} from "./version";
import {Artifacts} from "./artifacts";
import {IRule} from "./rules/_irule";

export interface IGlobalConfig {
  version: string;
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

  private static defaultVersion = Version.v753;
  private config: IConfig;

  public static getDefault(): Config {
    const rules: any = {};

    const sorted = Artifacts.getRules().sort((a, b) => { return a.getKey().localeCompare(b.getKey()); });
    for (const rule of sorted) {
      rules[rule.getKey()] = rule.getConfig();
    }

    const config: IConfig = {
      global: {
        version: versionToText(Config.defaultVersion),
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
      switch (this.readByKey(rule.getKey(), "enabled")) {
        case true:
          rule.setConfig(this.readByRule(rule.getKey()));
          rules.push(rule);
          break;
        case undefined:
          if (this.config.global && this.config.global.applyUnspecifiedRules === true) {
            rules.push(rule);
          }
          break;
        default:
          break;
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

  public getSyntaxSetttings(): ISyntaxSettings {
    return this.config.syntax;
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