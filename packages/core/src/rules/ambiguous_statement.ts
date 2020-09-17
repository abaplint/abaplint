import {Issue} from "../issue";
import * as Statements from "../abap/2_statements/statements";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import {StatementNode} from "../abap/nodes";
import {IStatement} from "../abap/2_statements/statements/_statement";
import {Combi} from "../abap/2_statements/combi";
import {IRegistry} from "../_iregistry";
import {Version} from "../version";

export class AmbiguousStatementConf extends BasicRuleConfig {
}

export class AmbiguousStatement extends ABAPRule {
  private conf = new AmbiguousStatementConf();

  public getMetadata() {
    return {
      key: "ambiguous_statement",
      title: "Check for ambigious statements",
      shortDescription: `Checks for ambiguity between deleting or modifying from internal and database table
Add "TABLE" keyword or "@" for escaping SQL variables`,
    };
  }

  private getMessage(): string {
    return "Ambiguous statement. Use explicit syntax.";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: AmbiguousStatementConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    if (this.reg.getConfig().getVersion() < Version.v740sp05) {
      return [];
    }

    for (const statement of file.getStatements()) {
      let match = false;

      if (statement.get() instanceof Statements.DeleteDatabase) {
        match = this.tryMatch(statement, this.reg, Statements.DeleteInternal);
      } else if (statement.get() instanceof Statements.DeleteInternal) {
        match = this.tryMatch(statement, this.reg, Statements.DeleteDatabase);
      } else if (statement.get() instanceof Statements.ModifyInternal) {
        match = this.tryMatch(statement, this.reg, Statements.ModifyDatabase);
      } else if (statement.get() instanceof Statements.ModifyDatabase) {
        match = this.tryMatch(statement, this.reg, Statements.ModifyInternal);
      }

      if (match) {
        const issue = Issue.atStatement(file, statement, this.getMessage(), this.getMetadata().key, this.conf.severity);
        issues.push(issue);
      }

    }

    return issues;
  }

  private tryMatch(st: StatementNode, reg: IRegistry, type1: new () => IStatement): boolean {
    const ver = reg.getConfig().getVersion();

    const tokens = st.getTokens().slice(0);
    tokens.pop();

    const match = Combi.run(new type1().getMatcher(), tokens, ver);

    return match !== undefined;
  }

}