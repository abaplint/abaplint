import {Version, LanguageVersion, defaultVersion, ABAPRelease, versionToABAPRelease} from "./version";
import {ArtifactsRules} from "./artifacts_rules";
import {IRule} from "./rules/_irule";
import {IConfig, IGlobalConfig, ISyntaxSettings, IConfiguration} from "./_config";
import * as JSON5 from "json5";

// assumption: this class is immutable
export class Config implements IConfiguration {
  private readonly config: IConfig;

  public static getDefault(ver?: Version, langVer?: LanguageVersion, openABAP?: boolean): Config {
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

    // defaults: dont skip anything, report everything. The user can decide to skip stuff
    // its difficult to debug errors not being reported
    const config: IConfig = {
      global: {
        files: "/src/**/*.*",
        exclude: [],
        noIssues: [],
        skipGeneratedBOPFInterfaces: false,
        skipGeneratedFunctionGroups: false,
        skipGeneratedGatewayClasses: false,
        skipGeneratedPersistentClasses: false,
        skipGeneratedProxyClasses: false,
        skipGeneratedProxyInterfaces: false,
        useApackDependencies: false,
        skipIncludesWithoutMain: false,
        errorOnDuplicateFilenames: false,
      },
      dependencies: [{
        url: "https://github.com/abaplint/deps",
        folder: "/deps",
        files: "/src/**/*.*",
      }],
      syntax: {
        version,
        languageVersion: langVer,
        openABAP,
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
      const ruleConfig = this.config["rules"]?.[rule.getMetadata().key];
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
    } else {
      // remove duplicates,
      this.config.syntax.globalConstants = [...new Set(this.config.syntax.globalConstants)];
    }
    if (this.config.global.skipIncludesWithoutMain === undefined) {
      this.config.global.skipIncludesWithoutMain = false;
    }
    if (this.config.global.errorOnDuplicateFilenames === undefined) {
      this.config.global.errorOnDuplicateFilenames = false;
    }
    this.checkVersion();
  }

  public get(): IConfig {
    return this.config;
  }

  public readByKey(rule: string, key: string) {
    if (this.config["rules"]) {
      return this.config["rules"][rule] ? this.config["rules"][rule][key] : undefined;
    } else {
      return undefined;
    }
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

  public getRelease(): ABAPRelease {
    const v = this.config.syntax.version;
    if (v !== undefined && typeof v !== "string") {
      return v.release;
    }
    return versionToABAPRelease(this.getVersion());
  }

  public getOpenABAP(): boolean {
    return this.config.syntax.openABAP === true;
  }

  public getVersion(): Version {
    const v = this.config.syntax.version;
    if (this.config.global === undefined || v === undefined || typeof v !== "string") {
      return defaultVersion;
    }
    return v;
  }

  public getLanguageVersion(): LanguageVersion {
    const v = this.config.syntax.version;
    if (v !== undefined && typeof v !== "string") {
      return v.language;
    }
    return this.config.syntax.languageVersion ?? LanguageVersion.Normal;
  }

  private checkVersion() {
    const version = this.config.syntax.version;
    if (version === undefined || typeof version !== "string") {
      return; // undefined handled in getVersion, object form is already explicit
    }
    let match = false;
    const vers: any = Version;
    for (const v in Version) {
      if (vers[v] === version) {
        match = true;
        break;
      }
    }
    if (match === false) {
      this.config.syntax.version = defaultVersion;
      return;
    }
    if (version === Version.Cloud) {
      this.config.syntax.languageVersion = LanguageVersion.Cloud;
    } else if (version === Version.OpenABAP) {
      this.config.syntax.version = Version.v702;
      this.config.syntax.openABAP = true;
    }
  }

}
