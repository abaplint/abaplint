import {NamingRuleConfig} from "../rules/_naming_rule_config";

export class NameValidator {

  public static violatesRule(name: string, pattern: RegExp, params: NamingRuleConfig): boolean {
    if (params.ignoreNames && params.ignoreNames.indexOf(name.toUpperCase()) >= 0) {
      return false;
    }

    for (const ignored of params.ignorePatterns || []) {
      if (new RegExp(ignored, "i").test(name)) {
        return false;
      }
    }

    return params.patternKind === "required" ?
      pattern.test(name) === false :
      pattern.test(name) === true;
  }

}