import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {ExpressionNode, StatementNode} from "../abap/nodes";
import * as Expressions from "../abap/2_statements/expressions";
import {IRuleMetadata, RuleTag} from "./_irule";

export class KeepSingleParameterCallsOnOneLineConf extends BasicRuleConfig {
  /** Max line length, in characters */
  public length: number = 120;
}

export class KeepSingleParameterCallsOnOneLine extends ABAPRule {
  private conf = new KeepSingleParameterCallsOnOneLineConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "keep_single_parameter_on_one_line",
      title: "Keep single parameters on one line",
      shortDescription: `Keep single parameter calls on one line`,
      extendedInformation: `https://github.com/SAP/styleguides/blob/master/clean-abap/CleanABAP.md#keep-single-parameter-calls-on-one-line`,
      tags: [RuleTag.Whitespace, RuleTag.Styleguide],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: KeepSingleParameterCallsOnOneLineConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile): Issue[] {
    let issues: Issue[] = [];

    const stru = file.getStructure();
    if (stru === undefined) {
      return [];
    }

    for (const s of file.getStatements()) {
      // todo, add this as configurable
      if (this.calcStatementLength(s) > this.getConfig().length
          || this.containsNewLineValue(s)
          || this.containsNewLineTableExpression(s)
          || this.containsNewlineTemplate(s)) {
        continue;
      }
      for (const c of s.findAllExpressions(Expressions.MethodCallParam)) {
        issues = issues.concat(this.check(c, file));
      }
    }

    return issues;
  }

///////////////////////////////////////

  private containsNewLineTableExpression(s: StatementNode): boolean {
    for (const st of s.findAllExpressions(Expressions.TableExpression)) {
      const tokens = st.getAllTokens();
      if (tokens[0].getRow() !== tokens[tokens.length - 1].getRow()) {
        return true;
      }
    }
    return false;
  }

  private containsNewLineValue(s: StatementNode): boolean {
    for (const st of s.findAllExpressions(Expressions.Source)) {
      const first = st.getFirstToken().getStr().toUpperCase();
      if (first === "VALUE") {
        const tokens = st.getAllTokens();
        if (tokens[0].getRow() !== tokens[tokens.length - 1].getRow()) {
          return true;
        }
      }
    }
    return false;
  }

  private containsNewlineTemplate(s: StatementNode): boolean {
    for (const st of s.findAllExpressions(Expressions.StringTemplate)) {
      for (const t of st.getAllTokens()) {
        if (t.getStr().includes("\\n")) {
          return true;
        }
      }
    }
    return false;
  }

  private check(c: ExpressionNode, file: ABAPFile): Issue[] {
    if (this.isSingleParameter(c) === true && this.isMultiLine(c) === true) {

      for (const sub of c.findAllExpressions(Expressions.MethodCallParam)) {
        if (this.isSingleParameter(sub) === false
            && this.isWithoutParameters(sub) === false) {
          return [];
        }
      }

      const message = "Keep single parameter on one line";
      return [Issue.atToken(file, c.getFirstToken(), message, this.getMetadata().key)];
    }
    return [];
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

  private isWithoutParameters(c: ExpressionNode): boolean {
    return c.getChildren().length === 2;
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