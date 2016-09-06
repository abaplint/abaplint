import {IRule} from "./rule";
import {File} from "../file";
import Issue from "../issue";
import * as Statements from "../statements/";

export class ObsoleteStatementConf {
  public enabled: boolean = true;
}

export class ObsoleteStatement implements IRule {

  private conf = new ObsoleteStatementConf();

  public getKey(): string {
    return "obsolete_statement";
  }

  public getDescription(): string {
    return "Statement is obsolete";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf) {
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
          && sta.getTokens()[0].getStr() === "MOVE"
          && sta.getTokens()[1].getStr() !== "-" )
          || sta instanceof Statements.Divide) {
        let issue = new Issue(this, sta.getStart(), file);
        file.add(issue);
      }
    }
  }
}