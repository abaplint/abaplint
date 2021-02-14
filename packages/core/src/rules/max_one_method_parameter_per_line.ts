import * as Expressions from "../abap/2_statements/expressions";
import * as Statements from "../abap/2_statements/statements";
import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {ExpressionNode} from "../abap/nodes/expression_node";

export class MaxOneMethodParameterPerLineConf extends BasicRuleConfig {
}

export class MaxOneMethodParameterPerLine extends ABAPRule {
  private conf = new MaxOneMethodParameterPerLineConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "max_one_method_parameter_per_line",
      title: "Max one method parameter definition per line",
      shortDescription: `Keep max one method parameter description per line`,
      tags: [RuleTag.SingleFile, RuleTag.Whitespace],
      badExample: `
METHODS apps_scope_token
  IMPORTING
    body TYPE bodyapps_scope_token client_id TYPE str.`,
      goodExample: `
METHODS apps_scope_token
  IMPORTING
    body      TYPE bodyapps_scope_token
    client_id TYPE str.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: MaxOneMethodParameterPerLineConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    for (const statement of file.getStructure()?.findAllStatements(Statements.MethodDef) || []) {
      let prev: ExpressionNode | undefined = undefined;
      for (const p of statement.findAllExpressions(Expressions.MethodParam)) {
        if (prev === undefined) {
          prev = p;
          continue;
        }

        if (prev.getFirstToken().getStart().getRow() === p.getFirstToken().getStart().getRow()) {
          const issue = Issue.atToken(file, prev.getFirstToken(), this.getMetadata().title, this.getMetadata().key, this.conf.severity);
          issues.push(issue);
        }

        prev = p;
      }
    }

    return issues;
  }

}