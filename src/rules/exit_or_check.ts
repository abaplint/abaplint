import {IRule} from "./rule";
import {ParsedFile} from "../file";
import {Issue} from "../issue";
import {Statement} from "../statements/statement";
import * as Statements from "../statements/";

export class ExitOrCheckConf {
  public enabled: boolean = true;
}

export class ExitOrCheck implements IRule {

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

  public setConfig(conf) {
    this.conf = conf;
  }

  public run(file: ParsedFile) {
    let stack: Array<Statement> = [];
    let issues: Array<Issue> = [];

    for (let statement of file.getStatements()) {
      if (statement instanceof Statements.Loop
          || statement instanceof Statements.While
          || (statement instanceof Statements.Select && statement.isStructure())
          || statement instanceof Statements.Do) {
        stack.push(statement);
      } else if (statement instanceof Statements.Endloop
          || statement instanceof Statements.Endwhile
          || statement instanceof Statements.Endselect
          || statement instanceof Statements.Enddo) {
        stack.pop();
      } else if ((statement instanceof Statements.Check
          || statement instanceof Statements.Exit)
          && stack.length === 0) {
        let issue = new Issue(this, statement.getStart(), file);
        issues.push(issue);
      }
    }

    return issues;
  }

}