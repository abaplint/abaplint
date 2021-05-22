import {Version} from "./version";
import {IRule} from "./rules/_irule";

export interface IGlobalConfig {
  /** input files, glob format */
  files: string;
  skipGeneratedGatewayClasses: boolean;
  skipGeneratedPersistentClasses: boolean;
  skipGeneratedFunctionGroups: boolean;
  /** Clone and parse dependencies specified in .apack-manifest.xml if it is present */
  useApackDependencies?: boolean;
  /** Do not report any issues for includes without main programs */
  skipIncludesWithoutMain?: boolean;
  /** list of files to exclude, case insensitive regex */
  exclude?: string[];
}

export interface IDependency {
  /** Url of a git repository */
  url?: string;
  /** Name of local folder with dependencies */
  folder?: string;
  /** File search, glob pattern */
  files: string;
}

export interface ISyntaxSettings {
  /** ABAP language version */
  version?: Version;
  /** Report error for objects in this regex namespace. Types not in namespace will be void */
  errorNamespace: string;
  /** List of full named global constants */
  globalConstants?: string[];
  /** List of full named global macros */
  globalMacros?: string[];
}

export interface IRenameSettings {
  /** output folder */
  output: string;
  /** list of regex, matches filenames to be skipped, case insensitive */
  skip?: string[];
  /** List of rename patterns */
  patterns: {
    /** Object type, example "CLAS", regex, case insensitive */
    type: string,
    /** Matches object name, regex, case insensitive */
    oldName: string,
    /** new name, match groups from oldName regex can be used */
    newName: string,
  }[];
}

export interface IAbaplintAppSettings {
  /** Enable or disable observations, enabled by default */
  observations?: boolean,
}

export interface IConfig {
  /** Global settings */
  global: IGlobalConfig;
  /** External git dependencies used for syntax checks */
  dependencies?: IDependency[];
  /** Syntax settings */
  syntax: ISyntaxSettings;
  /** Automatic object rename settings, use with command line paramter "--rename" */
  rename?: IRenameSettings;
  /** abaplint.app settings, see https://docs.abaplint.app */
  app?: IAbaplintAppSettings;
  /** Settings for each rule, see https://rules.abaplint.org */
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