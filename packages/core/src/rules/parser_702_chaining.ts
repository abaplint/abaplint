import * as Expressions from "../abap/2_statements/expressions";
import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {RuleTag, IRuleMetadata} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {Version} from "../version";
import {Statements} from "..";
import {ExpressionNode} from "../abap/nodes";

export class Parser702ChainingConf extends BasicRuleConfig {
}

export class Parser702Chaining extends ABAPRule {
  private conf = new Parser702ChainingConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "parser_702_chaining",
      title: "Parser Error, bad chaining on 702",
      shortDescription:
`ABAP on 702 does not allow for method chaining with IMPORTING/EXPORTING/CHANGING keywords,
this rule finds these and reports errors.
Only active on target version 702 and below.`,
      tags: [RuleTag.Syntax, RuleTag.SingleFile],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: Parser702ChainingConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    if (this.reg.getConfig().getVersion() !== Version.v702
        && this.reg.getConfig().getVersion() !== Version.v700) {
      return [];
    }

    const stru = file.getStructure();
    if (stru === undefined) {
      return [];
    }

    for (const chain of stru.findAllExpressions(Expressions.MethodCallChain)) {
      const calls = chain.findDirectExpressions(Expressions.MethodCall);
      if (calls.length < 2) {
        continue;
      }
      for (const call of calls) {
        const callParam = call.findDirectExpression(Expressions.MethodCallParam);
        if (callParam === undefined) {
          continue;
        }
        const param = callParam.findDirectExpression(Expressions.MethodParameters);
        if (param === undefined) {
          continue;
        }
        if (param.findDirectTokenByText("IMPORTING")
            || param.findDirectTokenByText("CHANGING")
            || param.findDirectTokenByText("EXCEPTIONS")) {
          const message = "This kind of method chaining not possible in 702";
          this.pushIssue(message, file, param, issues);
        }
      }
    }

    // after a value assignment (move statement whose source is a method call, or method parameter assignment),
    // there can't be any EXPORTING/IMPORTING/CHANGING/EXCEPTIONS
    for (const statement of file.getStatements()) {
      if (!(statement.get() instanceof Statements.Move)) {
        continue;
      }
      const source = statement.findDirectExpression(Expressions.Source);
      if (source === undefined) {
        continue;
      }
      this.ensureSourceHasNoProceduralKeywords(source, file, issues);
    }
    for (const methodParameters of stru.findAllExpressions(Expressions.MethodParameters)) {
      for (const params of methodParameters.findAllExpressions(Expressions.ParameterS)) {
        const source = params.findDirectExpression(Expressions.Source);
        if (source === undefined) {
          continue;
        }
        this.ensureSourceHasNoProceduralKeywords(source, file, issues);
      }
    }

    return issues;
  }


  private ensureSourceHasNoProceduralKeywords(source: ExpressionNode, file: ABAPFile, issues: Issue[]) {
    const forbiddenTokens = ["EXPORTING", "IMPORTING", "CHANGING", "EXCEPTIONS"];
    for (const param of source.findAllExpressions(Expressions.MethodParameters)) {
      const usedForbiddenToken = forbiddenTokens.find(text => param.findDirectTokenByText(text));

      if (usedForbiddenToken) {
        const message = `Unexpected word ${usedForbiddenToken} in functional method call`;
        this.pushIssue(message, file, param, issues);
      }
    }
  }

  private pushIssue(message: string, file: ABAPFile, node: ExpressionNode, issues: Issue[]) {
    const issue = Issue.atPosition(file, node.getFirstToken().getStart(), message, this.getMetadata().key, this.conf.severity);
    issues.push(issue);
  }
}