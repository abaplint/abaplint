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

// assumption: this class is immutable
export class Config {

  private static readonly defaultVersion = Version.v755;
  private readonly config: IConfig;

  public static getDefault(ver?: Version): Config {
    const rules: any = {};

    const sorted = Artifacts.getRules().sort((a, b) => { return a.getKey().localeCompare(b.getKey()); });
    for (const rule of sorted) {
      rules[rule.getKey()] = rule.getConfig();
    }

    let version = versionToText(Config.defaultVersion);
    if (ver) {
      version = versionToText(ver);
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
        version,
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
      const ruleConfig = this.config["rules"][rule.getKey()];
      const ruleExists = ruleConfig !== undefined;

      if (ruleExists) {
        if (ruleConfig === true) { // "rule": true
          rules.push(rule);
        } else if (typeof ruleConfig === "object") {
          if (ruleConfig.enabled === true || ruleConfig.enabled === undefined) {
            rule.setConfig(ruleConfig);
            rules.push(rule);
          }
        }
      } else if (this.config.global.applyUnspecifiedRules) {
        rules.push(rule);
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
/*
  public setVersion(ver: Version | undefined): Config {
    if (ver === undefined) {
      return this;
    }
    this.config.syntax.version = versionToText(ver);
    return this;
  }
*/
}