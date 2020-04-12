import {IObject} from "../objects/_iobject";
import {Issue} from "../issue";
import {IRegistry} from "../_iregistry";

/** Rule Metadata */
export interface IRuleMetadata {
  /** Rule title */
  title?: string;
  /** Rule key, no whitespace allowed, always lower case, words separated by underscore
   * Used in abaplint.json configuration files
   */
  key: string;
  /** Short description in markdown, can be shown in editors */
  shortDescription?: string;
  /** Does the rule implement quickfixes? */
  quickfix?: boolean;
  /** Extended information, markdown, only shown on rules.abaplint.org */
  extendedInformation?: string;
  /** ABAP code with bad example, shown on rules.abaplint.org */
  badExample?: string;
  /** ABAP code with good example, shown on rules.abaplint.org */
  goodExample?: string;
}

/** Rule Interface */
export interface IRule {
  getMetadata(): IRuleMetadata;
  getConfig(): void;
  setConfig(conf: any): void;
  run(obj: IObject, reg: IRegistry): readonly Issue[];
}