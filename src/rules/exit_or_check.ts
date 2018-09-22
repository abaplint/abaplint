import {IRule} from "./rule";
import {Issue} from "../issue";
import {Statement} from "../abap/statements/statement";
import * as Statements from "../abap/statements/";
import {ABAPObject} from "../objects";

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

  public run(obj) {
    if (!(obj instanceof ABAPObject)) {
      return [];
    }

    let abap = obj as ABAPObject;
    let issues: Array<Issue> = [];

    for (let file of abap.getParsed()) {
      let stack: Array<Statement> = [];

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
          let issue = new Issue(this, file, statement.getStart());
          issues.push(issue);
        }
      }
    }

    return issues;
  }

}