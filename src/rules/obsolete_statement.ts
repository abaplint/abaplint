import { Rule } from "./rule";
import File from "../file";
import Issue from "../issue";
import * as Statements from "../statements/";

export class ObsoleteStatementConf {
  public enabled: boolean = true;
}

export class ObsoleteStatement implements Rule {

  private conf = new ObsoleteStatementConf();

  public get_key(): string {
    return "obsolete_statement";
  }

  public get_description(): string {
    return "Statement is obsolete";
  }

  public get_config() {
    return this.conf;
  }

  public set_config(conf) {
    this.conf = conf;
  }

  public run(file: File) {
    let statements = file.getStatements();

    for (let sta of statements) {
      if (sta instanceof Statements.Refresh
          || sta instanceof Statements.Compute
          || sta instanceof Statements.Add
          || sta instanceof Statements.Subtract
          || sta instanceof Statements.Multiply
          || ( sta instanceof Statements.Move
          && sta.getTokens()[0].getStr() === 'MOVE'
          && sta.getTokens()[1].getStr() !== '-' )
          || sta instanceof Statements.Divide) {
        let issue = new Issue(this, sta.getStart(), file);
        file.add(issue);
      }
    }
  }
}