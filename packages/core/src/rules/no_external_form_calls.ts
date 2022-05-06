import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Issue} from "../issue";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";

export class NoExternalFormCallsConf extends BasicRuleConfig {
}

export class NoExternalFormCalls extends ABAPRule {

  private conf = new NoExternalFormCallsConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "no_external_form_calls",
      title: "No external FORM calls",
      shortDescription: `Detect external form calls`,
      badExample: `PERFORM foo IN PROGRAM bar.

PERFORM foo(bar).`,
      tags: [RuleTag.SingleFile],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: NoExternalFormCallsConf): void {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    const stru = file.getStructure();
    if (stru === undefined) {
      return issues; // parser error
    }

    for (const p of stru.findAllStatements(Statements.Perform)) {
      if (p.findDirectExpression(Expressions.IncludeName) || p.findDirectTokenByText("PROGRAM")) {
        const message = "No external FORM calls";
        issues.push(Issue.atStatement(file, p, message, this.getMetadata().key, this.conf.severity));
      }
    }

    return issues;
  }

}