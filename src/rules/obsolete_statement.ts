import {Issue} from "../issue";
import * as Statements from "../abap/statements/";
import {ABAPRule} from "./abap_rule";
import {ParsedFile} from "../files";

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

  public runParsed(file: ParsedFile) {
    let issues: Array<Issue> = [];

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
        let issue = new Issue({rule: this, file, message: 1, start: sta.getStart()});
        issues.push(issue);
      }
    }

    return issues;
  }
}