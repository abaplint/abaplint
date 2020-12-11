import {Version, defaultVersion} from "./version";
import {ArtifactsRules} from "./artifacts_rules";
import {IRule} from "./rules/_irule";
import {IConfig, IGlobalConfig, ISyntaxSettings, IConfiguration} from "./_config";
import * as JSON5 from "json5";

// assumption: this class is immutable
export class Config implements IConfiguration {
  private readonly config: IConfig;

  public static getDefault(ver?: Version): Config {
    const rules: any = {};

    const sorted = ArtifactsRules.getRules().sort((a, b) => {
      return a.getMetadata().key.localeCompare(b.getMetadata().key);
    });

    for (const rule of sorted) {
      rules[rule.getMetadata().key] = rule.getConfig();
    }

    let version = defaultVersion;
    if (ver) {
      version = ver;
    }

    const config: IConfig = {
      global: {
        files: "/src/**/*.*",
        exclude: [],
        skipGeneratedGatewayClasses: true,
        skipGeneratedPersistentClasses: true,
        skipGeneratedFunctionGroups: true,
        useApackDependencies: false,
        skipIncludesWithoutMain: false,
      },
      dependencies: [{
        url: "https://github.com/abaplint/deps",
        folder: "/deps",
        files: "/**/*.*",
      }],
      syntax: {
        version,
        errorNamespace: "^(Z|Y|LCL\_|TY\_|LIF\_)",
        globalConstants: [],
        globalMacros: [],
      },
      rules: rules,
    };

    return new Config(JSON.stringify(config));
  }

  public getEnabledRules(): IRule[] {
    const rules: IRule[] = [];
    for (const rule of ArtifactsRules.getRules()) {
      const ruleConfig = this.config["rules"][rule.getMetadata().key];
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
    // huh, hack
    if (JSON5.parse === undefined) {
      // @ts-ignore
      JSON5.parse = JSON5.default.parse;
    }
    this.config = JSON5.parse(json);

    if (this.config.global === undefined) {
      this.config.global = Config.getDefault().getGlobal();
    }
    if (this.config.syntax === undefined) {
      this.config.syntax = Config.getDefault().getSyntaxSetttings();
    }
    if (this.config.syntax.globalMacros === undefined) {
      this.config.syntax.globalMacros = [];
    }
    if (this.config.syntax.globalConstants === undefined) {
      this.config.syntax.globalConstants = [];
    }
    if (this.config.global.skipIncludesWithoutMain === undefined) {
      this.config.global.skipIncludesWithoutMain = false;
    }
    this.checkVersion();
  }

  public get(): IConfig {
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
      return defaultVersion;
    }
    return this.config.syntax.version;
  }

  private checkVersion() {
    if (this.config.syntax.version === undefined) {
      return; // handled in getVersion
    }
    let match = false;
    for (const v in Version) {
      if (v === this.config.syntax.version) {
        match = true;
        break;
      }
    }
    if (match === false) {
      this.config.syntax.version = defaultVersion;
    }
  }

}
