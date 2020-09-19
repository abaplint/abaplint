import {Severity} from "../severity";

export abstract class BasicRuleConfig {
  /** List of file regex filename patterns to exclude, case insensitive */
  public exclude?: string[] = [];
  /** Problem severity */
  public severity?: Severity = Severity.Error;
}