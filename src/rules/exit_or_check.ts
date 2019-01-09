import {Issue} from "../issue";
import * as Statements from "../abap/statements/";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {StatementNode} from "../abap/nodes/";
import {BasicRuleConfig} from "./_basic_rule_config";

export class ExitOrCheckConf extends BasicRuleConfig {
}

export class ExitOrCheck extends ABAPRule {

  private conf = new ExitOrCheckConf();

  public getKey(): string {
    return "exit_or_check";
  }

  public getDescription(): string {
    return "EXIT or CHECK outside of loop";
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
        const issue = new Issue({file, message: this.getDescription(), key: this.getKey(), start: statement.getStart()});
        issues.push(issue);
      }
    }

    return issues;
  }

}