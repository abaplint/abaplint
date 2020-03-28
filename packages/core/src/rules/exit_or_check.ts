import {Issue} from "../issue";
import * as Statements from "../abap/2_statements/statements";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {StatementNode} from "../abap/nodes/";
import {BasicRuleConfig} from "./_basic_rule_config";

/** Detects usages of EXIT or CHECK statements outside of loops. */
export class ExitOrCheckConf extends BasicRuleConfig {
}

export class ExitOrCheck extends ABAPRule {

  private conf = new ExitOrCheckConf();

  public getKey(): string {
    return "exit_or_check";
  }

  private getDescription(): string {
    return "EXIT and CHECK are not allowed outside of loops.";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: ExitOrCheckConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    const stack: StatementNode[] = [];

    for (const statement of file.getStatements()) {
      if (statement.get() instanceof Statements.Loop
          || statement.get() instanceof Statements.While
          || statement.get() instanceof Statements.SelectLoop
          || statement.get() instanceof Statements.Do) {
        stack.push(statement);
      } else if (statement.get() instanceof Statements.EndLoop
          || statement.get() instanceof Statements.EndWhile
          || statement.get() instanceof Statements.EndSelect
          || statement.get() instanceof Statements.EndDo) {
        stack.pop();
      } else if ((statement.get() instanceof Statements.Check
          || statement.get() instanceof Statements.Exit)
          && stack.length === 0) {
        const issue = Issue.atStatement(file, statement, this.getDescription(), this.getKey());
        issues.push(issue);
      }
    }

    return issues;
  }

}