import {Issue} from "../issue";
import * as Statements from "../abap/statements";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import {StatementNode} from "../abap/nodes";
import {Statement} from "../abap/statements/_statement";
import {Combi} from "../abap/combi";
import {Registry} from "../registry";

// todo, this rule can be disabled when using strict SQL

/** Checks for ambiguity between deleting from internal and database table */
export class AmbiguousStatementConf extends BasicRuleConfig {
}

export class AmbiguousStatement extends ABAPRule {
  private conf = new AmbiguousStatementConf();

  public getKey(): string {
    return "ambiguous_statement";
  }

  private getDescription(): string {
    return "Ambiguous DELETE statement. Use explicit syntax.";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: AmbiguousStatementConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, reg: Registry) {
    const issues: Issue[] = [];

    for (const statement of file.getStatements()) {
      let match = false;

      if (statement.get() instanceof Statements.DeleteDatabase) {
        match = this.tryMatch(statement, reg, Statements.DeleteInternal);
      } else if (statement.get() instanceof Statements.DeleteInternal) {
        match = this.tryMatch(statement, reg, Statements.DeleteDatabase);
      }


      if (match) {
        issues.push(new Issue({
          file,
          message: this.getDescription(),
          key: this.getKey(),
          start: statement.getStart()}));
      }

    }

    return issues;
  }

  private tryMatch(st: StatementNode, reg: Registry, type1: new () => Statement): boolean {
    const ver = reg.getConfig().getVersion();

    const tokens = st.getTokens();
    tokens.pop();

    const match = Combi.run(new type1().getMatcher(), tokens, ver);

    return match !== undefined;
  }

}