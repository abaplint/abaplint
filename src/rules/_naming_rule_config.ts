import {BasicRuleConfig} from "./_basic_rule_config";

export type PatternKind = "required" | "forbidden";

export abstract class NamingRuleConfig extends BasicRuleConfig {
  /** Specifies whether the pattern is forbidden (violation if name matches) or required (violation if name does not match). */
  public patternKind?: PatternKind = "required";

  /** A list of names to be ignored */
  public ignoreNames?: string[] = [];

  /** A list of patterns to be ignored. For example, you can use it to ignore ambiguous prefixes */
  public ignorePatterns?: string[] = [];
}
