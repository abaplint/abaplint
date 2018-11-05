import {Issue} from "../issue";
import * as Statements from "../abap/statements/";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {StatementNode} from "../abap/node";

export class ExitOrCheckConf {
  public enabled: boolean = true;
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
    let issues: Issue[] = [];

    let stack: StatementNode[] = [];

    for (let statement of file.getStatements()) {
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
        let issue = new Issue({rule: this, file, message: 1, start: statement.getStart()});
        issues.push(issue);
      }
    }

    return issues;
  }

}