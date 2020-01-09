import {Version} from "./version";
import {Artifacts} from "./artifacts";
import {IRule} from "./rules/_irule";

export interface IGlobalConfig {
  files: string;
  skipGeneratedGatewayClasses: boolean;
  skipGeneratedPersistentClasses: boolean;
  skipGeneratedFunctionGroups: boolean;
}

export interface IDependency {
  url?: string;
  folder?: string;
  files: string;
}

export interface ISyntaxSettings {
  version: Version;
  errorNamespace: string;
  globalConstants: string[];
  globalMacros: string[];
}

export interface IConfig {
  global: IGlobalConfig;
  /** External git dependencies used for syntax checks */
  dependencies?: IDependency[];
  syntax: ISyntaxSettings;
  rules: any;
}

// assumption: this class is immutable
export class Config {

  private static readonly defaultVersion = Version.v754;
  private readonly config: IConfig;

  public static getDefault(ver?: Version): Config {
    const rules: any = {};

    const sorted = Artifacts.getRules().sort((a, b) => {return a.getKey().localeCompare(b.getKey()); });
    for (const rule of sorted) {
      rules[rule.getKey()] = rule.getConfig();
    }

    let version = Config.defaultVersion;
    if (ver) {
      version = ver;
    }

    const config: IConfig = {
      global: {
        files: "/src/**/*.*",
        skipGeneratedGatewayClasses: true,
        skipGeneratedPersistentClasses: true,
        skipGeneratedFunctionGroups: true,
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
        if (ruleConfig === false) { // "rule": false
          continue;
        } else if (ruleConfig === true) { // "rule": true
          rules.push(rule);
        } else if (typeof ruleConfig === "object") { // "rule": { ...config }
          rule.setConfig(ruleConfig);
          rules.push(rule);
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
    return this.config.syntax.version;
  }

}