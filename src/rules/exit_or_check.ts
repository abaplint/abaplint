import {Issue} from "../issue";
import {Statement} from "../abap/statements/statement";
import * as Statements from "../abap/statements/";
import {ABAPRule} from "./abap_rule";
import {ParsedFile} from "../files";

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

  public runParsed(file: ParsedFile) {
    let issues: Array<Issue> = [];

    let stack: Array<Statement> = [];

    for (let statement of file.getStatements()) {
      if (statement instanceof Statements.Loop
          || statement instanceof Statements.While
          || statement instanceof Statements.Select
          || statement instanceof Statements.Do) {
        stack.push(statement);
      } else if (statement instanceof Statements.EndLoop
          || statement instanceof Statements.EndWhile
          || statement instanceof Statements.EndSelect
          || statement instanceof Statements.EndDo) {
        stack.pop();
      } else if ((statement instanceof Statements.Check
          || statement instanceof Statements.Exit)
          && stack.length === 0) {
        let issue = new Issue(this, file, 1, statement.getStart());
        issues.push(issue);
      }
    }

    return issues;
  }

}