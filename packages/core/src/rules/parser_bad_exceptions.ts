import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {RuleTag, IRuleMetadata} from "./_irule";
import {ABAPFile} from "../abap/abap_file";

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
      /*
      badExample: `IF ( foo = 'bar').`,
      goodExample: `IF ( foo = 'bar' ).`,
      */
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
      const found = statement.findDirectExpression(Expressions.FunctionParameters)?.findDirectExpression(Expressions.Field);
      if (found === undefined) {
        continue;
      }

      const message = "Bad EXCEPTIONS syntax in CALL FUNCTION";
      issues.push(Issue.atToken(file, found.getFirstToken(), message, this.getMetadata().key, this.conf.severity));
    }

    return issues;
  }

}