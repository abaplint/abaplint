import {Issue} from "../issue";
import {Unknown} from "../abap/2_statements/statements/_statement";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import {STATEMENT_MAX_TOKENS} from "../abap/2_statements/statement_parser";
import {RuleTag} from "./_irule";

export class ParserErrorConf extends BasicRuleConfig {
}

export class ParserError extends ABAPRule {
  private conf = new ParserErrorConf();

  public getMetadata() {
    return {
      key: "parser_error",
      title: "Parser error",
      shortDescription: `Checks for syntax unrecognized by abaplint.

See recognized syntax at https://syntax.abaplint.org`,
      tags: [RuleTag.Syntax],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: ParserErrorConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    for (const statement of file.getStatements()) {
      if (!(statement.get() instanceof Unknown)) {
        continue;
      }

      if (statement.getTokens().length > STATEMENT_MAX_TOKENS) {
        const message = "Statement too long, refactor statement";
        const issue = Issue.atToken(file, statement.getTokens()[0], message, this.getMetadata().key);
        issues.push(issue);
      } else {
        const tok = statement.getFirstToken();
        const message = "Statement does not exist in ABAP" + this.reg.getConfig().getVersion() + "(or a parser error), \"" + tok.getStr() + "\"";
        const issue = Issue.atStatement(file, statement, message, this.getMetadata().key);
        issues.push(issue);
      }
    }

    return issues;
  }

}