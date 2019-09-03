import {Issue} from "../../issue";
import {Position} from "../../position";
import * as Tokens from "../../abap/tokens";
import {Unknown} from "../../abap/statements/_statement";
import {ABAPRule} from "../_abap_rule";
import {ABAPFile} from "../../files";
import {StatementNode} from "../../abap/nodes";
import {Registry} from "../../registry";
import {versionToText} from "../../version";
import {BasicRuleConfig} from "../_basic_rule_config";

/** Checks for syntax unrecognized by abaplint */
export class ParserErrorConf extends BasicRuleConfig {
}

export class ParserError extends ABAPRule {

  private conf = new ParserErrorConf();

  public getKey(): string {
    return "parser_error";
  }

  public getDescription(): string {
    return "Parser error(Unknown statement)";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: ParserErrorConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, reg: Registry) {
    const issues: Issue[] = [];

    let start = new Position(0, 0);
    for (const statement of file.getStatements()) {
// only report one error per row
      if (statement.get() instanceof Unknown
            && start.getRow() !== statement.getStart().getRow()) {

        const missing = this.missingSpace(statement);
        if (missing) {
          const message = "Missing space between string or character literal and parentheses, Parser error";
          start = missing;
          issues.push(new Issue({file, message, key: this.getKey(), start}));
        } else {
          const message = this.getDescription() + ", ABAP version " + versionToText(reg.getConfig().getVersion());
          issues.push(new Issue({file, message,
            key: this.getKey(),
            start: statement.getStart(),
            end: statement.getEnd()}));
        }

      }
    }

    return issues;
  }

  private missingSpace(statement: StatementNode): Position | undefined {
    const tokens = statement.getTokens();
    for (let i = 0; i < tokens.length - 1; i++) {
      const current = tokens[ i ];
      const next = tokens[ i + 1 ];
      if (current.getRow() === next.getRow() &&
          current.getCol() + current.getStr().length === next.getCol() &&
          (current instanceof Tokens.String && next.getStr() === ")"
          || current.getStr() === "(" && next instanceof Tokens.String)) {
        return next.getStart();
      }
    }

    return undefined;
  }

}