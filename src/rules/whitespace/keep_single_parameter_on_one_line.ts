import {Issue} from "../../issue";
import {BasicRuleConfig} from "../_basic_rule_config";
import {ABAPRule} from "../_abap_rule";
import {ABAPFile} from "../../files";
import {ExpressionNode, StatementNode} from "../../abap/nodes";
import * as Expressions from "../../abap/expressions";

/** Keep single parameter calls on one line */
export class KeepSingleParameterCallsOnOneLineConf extends BasicRuleConfig {
}

export class KeepSingleParameterCallsOnOneLine extends ABAPRule {
  private conf = new KeepSingleParameterCallsOnOneLineConf();

  public getKey(): string {
    return "keep_single_parameter_on_one_line";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: KeepSingleParameterCallsOnOneLineConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile): Issue[] {
    const issues: Issue[] = [];

    const stru = file.getStructure();
    if (stru === undefined) {
      return [];
    }

    for (const s of file.getStatements()) {
      // todo, add this as configurable
      if (this.calcStatementLength(s) > 120) {
        continue;
      }
      for (const c of s.findAllExpressions(Expressions.MethodCall)) {
        if (this.isSingleParameter(c) === true
            && this.isMultiLine(c) === true) {
          const message = "Keep single parameter on one line";
          const issue = Issue.atToken(file, c.getFirstToken(), message, this.getKey());
          issues.push(issue);
        }
      }
    }

    return issues;
  }

  // including first indentation, worst case calculation add space after each token
  private calcStatementLength(c: StatementNode): number {
    let length = 0;
    for (const t of c.getTokens()) {
      if (length === 0) {
        length = length + t.getStart().getCol();
      }
      length = length + t.getStr().length + 1;
    }
    return length;
  }

  private isMultiLine(c: ExpressionNode): boolean {
    const tokens = c.getAllTokens();
    const first = tokens[0];
    const last = tokens[tokens.length - 1];

    return first.getStart().getRow() < last.getStart().getRow();
  }

  private isSingleParameter(c: ExpressionNode): boolean {
    if (c.findDirectExpression(Expressions.Source)) {
      return true;
    }

    const list = c.findDirectExpression(Expressions.ParameterListS);
    if (list) {
      return list.getChildren().length === 1;
    }

    const param = c.findDirectExpression(Expressions.MethodParameters);
    if (param) {
      if (param.getChildren().length > 2) {
        return false;
      }
      const paramsource = param.findDirectExpression(Expressions.ParameterListS);
      if (paramsource && paramsource.getChildren().length === 1) {
        return true;
      }

      const paramtarget = param.findDirectExpression(Expressions.ParameterListT);
      if (paramtarget && paramtarget.getChildren().length === 1) {
        return true;
      }
    }

    return false;
  }

}