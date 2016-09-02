import { IRule } from "./rule";
import File from "../file";
import Issue from "../issue";
import { Statement } from "../statements/statement";
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

  public run(file: File) {
    let stack: Array<Statement> = [];

    for (let statement of file.getStatements()) {
// todo, use AST instead
// todo, more work around SELECT
      if (statement instanceof Statements.Loop
          || statement instanceof Statements.While
          || (statement instanceof Statements.Select
            && / SINGLE /.test(statement.concatTokens()) === false
            && / TABLE /.test(statement.concatTokens()) === false)
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
        file.add(issue);
      }
    }
  }

}