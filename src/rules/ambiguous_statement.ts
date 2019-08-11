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

export class AmbiguousStatementConf extends BasicRuleConfig {
}

export class AmbiguousStatement extends ABAPRule {
  private conf = new AmbiguousStatementConf();

  public getKey(): string {
    return "ambiguous_statement";
  }

  public getDescription(): string {
    return "Ambiguous Statement";
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
      if (statement.get() instanceof Statements.DeleteDatabase || statement.get() instanceof Statements.DeleteInternal) {
        const match = this.tryMatchBoth(statement, reg, Statements.DeleteDatabase, Statements.DeleteInternal);
        if (match) {
          issues.push(new Issue({
            file,
            message: this.getDescription(),
            key: this.getKey(),
            start: statement.getStart()}));
        }
      }
    }

    return issues;
  }

  private tryMatchBoth(st: StatementNode, reg: Registry, type1: new () => Statement, type2: new () => Statement): boolean {
    const ver = reg.getConfig().getVersion();

    const tokens = st.getTokens();
    tokens.pop();

    const match1 = Combi.run(new type1().getMatcher(), tokens, ver);
    const match2 = Combi.run(new type2().getMatcher(), tokens, ver);

    return match1 !== undefined && match2 !== undefined;
  }

}