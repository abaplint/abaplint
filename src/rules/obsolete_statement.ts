import {Issue} from "../issue";
import * as Statements from "../abap/statements/";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {Compare} from "../abap/expressions";

export class ObsoleteStatementConf {
  public enabled: boolean = true;
}

export class ObsoleteStatement extends ABAPRule {

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

  public setConfig(conf: ObsoleteStatementConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    let issues: Array<Issue> = [];

    let statements = file.getStatements();

    for (let sta of statements) {
      if (sta.get() instanceof Statements.Refresh
          || sta.get() instanceof Statements.Compute
          || sta.get() instanceof Statements.Add
          || sta.get() instanceof Statements.Subtract
          || sta.get() instanceof Statements.Multiply
          || ( sta.get() instanceof Statements.Move
          && sta.getTokens()[0].getStr() === "MOVE"
          && sta.getTokens()[1].getStr() !== "-"
          && sta.getTokens()[1].getStr() !== "EXACT" )
          || sta.get() instanceof Statements.Divide) {
        issues.push(new Issue({file, message: this.getDescription(), code: this.getKey(), start: sta.getStart()}));
      }

      for (let compare of sta.findAllExpressions(Compare)) {
        let token = compare.findDirectTokenByText("REQUESTED");
        if (token) {
          issues.push(new Issue({file, message: "IS REQUESTED is obsolete", code: this.getKey(), start: token.getPos()}));
        }
      }
    }

    return issues;
  }
}