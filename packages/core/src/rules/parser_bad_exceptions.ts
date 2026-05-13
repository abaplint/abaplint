import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {RuleTag, IRuleMetadata} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {ExpressionNode} from "../abap/nodes/expression_node";

// todo: this rule needs refactoring

export class ParserBadExceptionsConf extends BasicRuleConfig {
}

export class ParserBadExceptions extends ABAPRule {
  private conf = new ParserBadExceptionsConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "parser_bad_exceptions",
      title: "Parser Error, bad EXCEPTIONS in CALL FUNCTION",
      shortDescription: `Checks for syntax not recognized by abaplint, related to EXCEPTIONS in CALL FUNCTION.`,
      tags: [RuleTag.Syntax, RuleTag.SingleFile],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: ParserBadExceptionsConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    for (const statement of file.getStatements()) {
      if (!(statement.get() instanceof Statements.CallFunction)) {
        continue;
      }

      const exceptionTokens = this.findExceptionTokens(statement);
      if (exceptionTokens !== undefined
          && this.containsMixedExceptionSyntax(statement.findAllExpressions(Expressions.ParameterException))) {
        const message = "Bad EXCEPTIONS syntax in CALL FUNCTION";
        for (const token of exceptionTokens) {
          issues.push(Issue.atToken(file, token, message, this.getMetadata().key, this.conf.severity));
        }
        continue;
      }

      for (const e of statement.findAllExpressions(Expressions.ParameterException)) {
        if (e.findDirectTokenByText("=") === undefined) {
          const message = "Bad EXCEPTIONS syntax in CALL FUNCTION";
          issues.push(Issue.atToken(file, e.getFirstToken(), message, this.getMetadata().key, this.conf.severity));
        }
      }
    }

    return issues;
  }

  private containsMixedExceptionSyntax(exceptions: readonly ExpressionNode[]) {
    return exceptions.some(e => e.findDirectTokenByText("=") === undefined)
      && exceptions.some(e => e.findDirectTokenByText("=") !== undefined);
  }

  private findExceptionTokens(statement: ReturnType<ABAPFile["getStatements"]>[number]) {
    const tokens = statement.getTokens();
    const index = tokens.findIndex(t => t.getStr().toUpperCase() === "EXCEPTIONS");
    if (index === -1) {
      return undefined;
    }
    return tokens.slice(index).filter(t => t.getStr() !== ".");
  }

}
