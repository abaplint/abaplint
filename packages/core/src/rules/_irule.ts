import {IObject} from "../objects/_iobject";
import {Issue} from "../issue";
import {IRegistry} from "../_iregistry";

export enum RuleTag {
  Experimental = "Experimental",
  DeprecationCandidate = "DeprecationCandidate",
  Upport = "Upport",
  Downport = "Downport",
  Whitespace = "Whitespace",
  Naming = "Naming",
  Quickfix = "Quickfix",
  Syntax = "Syntax",
  /** Relevant wrt the official SAP ABAP style guide*/
  Styleguide = "Styleguide",
  /** Single file compatible, the rule gives correct results when having only information about the single file */
  SingleFile = "SingleFile",
}

/** Rule Metadata */
export interface IRuleMetadata {
  /** Rule key, no whitespace allowed, always lower case, words separated by underscore
   * Used in abaplint.json configuration files
   */
  key: string;
  /** Rule title */
  title: string;
  /** Short description in markdown, can be shown in editors */
  shortDescription: string;
  /** ABAP code with bad example, shown on rules.abaplint.org */
  badExample?: string;
  /** ABAP code with good example, shown on rules.abaplint.org */
  goodExample?: string;
  /** Extended information, markdown, only shown on rules.abaplint.org */
  extendedInformation?: string;
  /** Various tags with additional usage information */
  tags?: RuleTag[];
}

/** Rule Interface */
export interface IRule {
  getMetadata(): IRuleMetadata;
  getConfig(): void;
  setConfig(conf: any): void;
  /** called one time before run() */
  initialize(reg: IRegistry): IRule;
  /** called for each object */
  run(obj: IObject): readonly Issue[];
}