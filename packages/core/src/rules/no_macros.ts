import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import * as Statements from "../abap/2_statements/statements";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";

export class NoMacrosConf extends BasicRuleConfig {
}

export class NoMacros extends ABAPRule {

  private conf = new NoMacrosConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "no_macros",
      title: "No macros",
      shortDescription: `Checks that macros are not used`,
      extendedInformation: `Macros reduce readability and are difficult to debug, use methods or form routines instead.

https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/abenmacros_guidl.htm`,
      tags: [RuleTag.SingleFile],
      badExample: `DEFINE _macro.
  WRITE 'hello'.
END-OF-DEFINITION.`,
      goodExample: `WRITE 'hello'.`,
    };
  }

  public getConfig(): NoMacrosConf {
    return this.conf;
  }

  public setConfig(conf: NoMacrosConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    for (const stat of file.getStatements()) {
      if (stat.get() instanceof Statements.Define) {
        issues.push(Issue.atStatement(file, stat, "Do not define macros", this.getMetadata().key, this.conf.severity));
      }
    }

    return issues;
  }

}
