import {Issue} from "../issue";
import * as Statements from "../abap/statements/";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {Compare} from "../abap/expressions";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Position} from "../position";

export class ObsoleteStatementConf extends BasicRuleConfig {
  public refresh: boolean = true;
  public compute: boolean = true;
  public add: boolean = true;
  public subtract: boolean = true;
  public multiply: boolean = true;
  public move: boolean = true;
  public divide: boolean = true;
  public requested: boolean = true;
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
    const issues: Issue[] = [];

    const statements = file.getStatements();
    let prev: Position | undefined = undefined;

    for (const sta of statements) {
      if ((sta.get() instanceof Statements.Refresh && this.conf.refresh)
          || (sta.get() instanceof Statements.Compute && this.conf.compute)
          || (sta.get() instanceof Statements.Add && this.conf.add)
          || (sta.get() instanceof Statements.Subtract && this.conf.subtract)
          || (sta.get() instanceof Statements.Multiply && this.conf.multiply)
          || (sta.get() instanceof Statements.Move && this.conf.move
          && sta.getTokens()[0].getStr() === "MOVE"
          && sta.getTokens()[1].getStr() !== "-"
          && sta.getTokens()[1].getStr() !== "EXACT" )
          || (sta.get() instanceof Statements.Divide && this.conf.divide)) {
        if (prev === undefined || sta.getStart().getCol() !== prev.getCol() || sta.getStart().getRow() !== prev.getRow()) {
          issues.push(new Issue({file, message: this.getDescription(), key: this.getKey(), start: sta.getStart()}));
        }
        prev = sta.getStart();
      }

      for (const compare of sta.findAllExpressions(Compare)) {
        const token = compare.findDirectTokenByText("REQUESTED");
        if (token) {
          issues.push(new Issue({file, message: "IS REQUESTED is obsolete", key: this.getKey(), start: token.getStart()}));
        }
      }
    }

    return issues;
  }
}