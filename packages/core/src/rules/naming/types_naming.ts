import {Issue} from "../../issue";
import {ABAPRule} from "../_abap_rule";
import {ABAPFile} from "../../files";
import * as Statements from "../../abap/2_statements/statements";
import * as Expressions from "../../abap/2_statements/expressions";
import {BasicRuleConfig} from "../_basic_rule_config";
import {ExpressionNode} from "../../abap/nodes";

/** Allows you to enforce a pattern for TYPES definitions */
export class TypesNamingConf extends BasicRuleConfig {
  /** The pattern for TYPES */
  public pattern: string = "^TY_.+$";
}

export class TypesNaming extends ABAPRule {

  private conf = new TypesNamingConf();

  public getMetadata() {
    return {key: "types_naming"};
  }

  public getConfig(): TypesNamingConf {
    return this.conf;
  }

  public setConfig(conf: TypesNamingConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];
    const testRegex = new RegExp(this.conf.pattern, "i");
    let nesting = 0;

    for (const stat of file.getStatements()) {
      let expr: ExpressionNode | undefined = undefined;

      if (stat.get() instanceof Statements.Type && nesting === 0) {
        expr = stat.findFirstExpression(Expressions.NamespaceSimpleName);
      } else if (stat.get() instanceof Statements.TypeBegin) {
        if (nesting === 0) {
          expr = stat.findFirstExpression(Expressions.NamespaceSimpleName);
        }
        nesting = nesting + 1;
      } else if (stat.get() instanceof Statements.TypeEnd) {
        nesting = nesting - 1;
        continue;
      } else {
        continue;
      }

      if (expr === undefined) {
        continue;
      }

      const token = expr.getFirstToken();

      if (testRegex.exec(token.getStr())) {
        continue;
      } else {
        const message = "Bad TYPES naming, expected \"" + this.conf.pattern + "\", got \"" + token.getStr() + "\"";
        const issue = Issue.atToken(file, token, message, this.getMetadata().key);
        issues.push(issue);
      }

    }

    return issues;
  }

}