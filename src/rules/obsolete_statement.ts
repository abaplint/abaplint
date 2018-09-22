import {IRule} from "./rule";
import {Issue} from "../issue";
import * as Statements from "../abap/statements/";
import {ABAPObject} from "../objects";

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

  public run(obj) {
    if (!(obj instanceof ABAPObject)) {
      return [];
    }

    let abap = obj as ABAPObject;
    let issues: Array<Issue> = [];

    for (let file of abap.getParsed()) {
      let statements = file.getStatements();

      for (let sta of statements) {
        if (sta instanceof Statements.Refresh
            || sta instanceof Statements.Compute
            || sta instanceof Statements.Add
            || sta instanceof Statements.Subtract
            || sta instanceof Statements.Multiply
            || ( sta instanceof Statements.Move
            && sta.getTokens()[0].getStr() === "MOVE"
            && sta.getTokens()[1].getStr() !== "-"
            && sta.getTokens()[1].getStr() !== "EXACT" )
            || sta instanceof Statements.Divide) {
          let issue = new Issue(this, file, sta.getStart());
          issues.push(issue);
        }
      }
    }

    return issues;
  }
}