import {Issue} from "../issue";
import * as Statements from "../abap/statements";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import {StatementNode} from "../abap/nodes";
import {Statement} from "../abap/statements/_statement";
import {Combi} from "../abap/combi";
import {Registry} from "../registry";
import {Version} from "../version";

/** Checks for ambiguity between deleting or modifying from internal and database table
 * Add "TABLE" keyword or "@" for escaping SQL variables
 */
export class AmbiguousStatementConf extends BasicRuleConfig {
}

export class AmbiguousStatement extends ABAPRule {
  private conf = new AmbiguousStatementConf();

  public getKey(): string {
    return "ambiguous_statement";
  }

  private getDescription(): string {
    return "Ambiguous statement. Use explicit syntax.";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: AmbiguousStatementConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, reg: Registry) {
    const issues: Issue[] = [];

    if (reg.getConfig().getVersion() < Version.v740sp05) {
      return [];
    }

    for (const statement of file.getStatements()) {
      let match = false;

      if (statement.get() instanceof Statements.DeleteDatabase) {
        match = this.tryMatch(statement, reg, Statements.DeleteInternal);
      } else if (statement.get() instanceof Statements.DeleteInternal) {
        match = this.tryMatch(statement, reg, Statements.DeleteDatabase);
      } else if (statement.get() instanceof Statements.ModifyInternal) {
        match = this.tryMatch(statement, reg, Statements.ModifyDatabase);
      } else if (statement.get() instanceof Statements.ModifyDatabase) {
        match = this.tryMatch(statement, reg, Statements.ModifyInternal);
      }

      if (match) {
        const issue = Issue.atStatement(file, statement, this.getDescription(), this.getKey());
        issues.push(issue);
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