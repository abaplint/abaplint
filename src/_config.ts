import {Version} from "./version";
import {IRule} from "./rules/_irule";

export interface IGlobalConfig {
  files: string;
  skipGeneratedGatewayClasses: boolean;
  skipGeneratedPersistentClasses: boolean;
  skipGeneratedFunctionGroups: boolean;
  /** Clone and parse dependencies specified in .apack-manifest.xml if it is present */
  useApackDependencies?: boolean;
}

export interface IDependency {
  /** Url of a git repository */
  url?: string;
  /** Name of local folder with dependencies */
  folder?: string;
  files: string;
}

export interface ISyntaxSettings {
  version: Version;
  errorNamespace: string;
  globalConstants?: string[];
  globalMacros?: string[];
}

export interface IConfig {
  global: IGlobalConfig;
  /** External git dependencies used for syntax checks */
  dependencies?: IDependency[];
  syntax: ISyntaxSettings;
  rules: any;
}

export interface IConfiguration {
  getEnabledRules(): IRule[];
  get(): IConfig;
  getGlobal(): IGlobalConfig;
  getVersion(): Version;
  getSyntaxSetttings(): ISyntaxSettings;
  readByRule(rule: string): any;
  readByKey(rule: string, key: string): any;
}