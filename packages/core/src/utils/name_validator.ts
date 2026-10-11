import {NamingRuleConfig} from "../rules/_naming_rule_config";

export class NameValidator {

  /** compile the configured ignorePatterns, case insensitive */
  public static compileIgnorePatterns(params: NamingRuleConfig): RegExp[] {
    return (params.ignorePatterns || []).map(ignored => new RegExp(ignored, "i"));
  }

  public static violatesRule(name: string, pattern: RegExp, params: NamingRuleConfig, ignorePatterns: readonly RegExp[]): boolean {
    if (params.ignoreNames && params.ignoreNames.indexOf(name.toUpperCase()) >= 0) {
      return false;
    }

    for (const ignored of ignorePatterns) {
      if (ignored.test(name)) {
        return false;
      }
    }

    return !params.patternKind || params.patternKind === "required" ?
      pattern.test(name) === false :
      pattern.test(name) === true;
  }

}
