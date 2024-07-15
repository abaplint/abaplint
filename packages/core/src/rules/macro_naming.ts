import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {ABAPObject} from "../objects/_abap_object";
import {TypePool} from "../objects";

export class MacroNamingConf extends BasicRuleConfig {
  /** The pattern for macros, case insensitive */
  public pattern: string = "^_.+$";
}

export class MacroNaming extends ABAPRule {

  private conf = new MacroNamingConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "macro_naming",
      title: "Macro naming conventions",
      shortDescription: `Allows you to enforce a pattern for macro definitions`,
      extendedInformation: `Use rule "avoid_use" to avoid macros altogether.`,
      tags: [RuleTag.Naming, RuleTag.SingleFile],
      badExample: `DEFINE something.
END-OF-DEFINITION.`,
      goodExample: `DEFINE _something.
END-OF-DEFINITION.`,
    };
  }

  public getConfig(): MacroNamingConf {
    return this.conf;
  }

  public setConfig(conf: MacroNamingConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, obj: ABAPObject) {
    const issues: Issue[] = [];
    const testRegex = new RegExp(this.conf.pattern, "i");

    if (obj instanceof TypePool) {
      return [];
    }

    for (const stat of file.getStatements()) {

      if (!(stat.get() instanceof Statements.Define)) {
        continue;
      }

      const expr = stat.findDirectExpression(Expressions.MacroName);
      if (expr === undefined) {
        continue;
      }

      const token = expr.getFirstToken();

      if (testRegex.exec(token.getStr())) {
        continue;
      } else {
        const message = "Bad macro name naming, expected \"" + this.conf.pattern + "\", got \"" + token.getStr() + "\"";
        const issue = Issue.atToken(file, token, message, this.getMetadata().key, this.conf.severity);
        issues.push(issue);
      }

    }

    return issues;
  }

}