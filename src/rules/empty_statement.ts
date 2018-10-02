import {Issue} from "../issue";
import {Empty} from "../abap/statements/statement";
import {ABAPRule} from "./abap_rule";

export class EmptyStatementConf {
  public enabled: boolean = true;
}

export class EmptyStatement extends ABAPRule {

  private conf = new EmptyStatementConf();

  public getKey(): string {
    return "empty_statement";
  }

  public getDescription(): string {
    return "Empty statement";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf) {
    this.conf = conf;
  }

  public runParsed(file) {
    let issues: Array<Issue> = [];

    let statements = file.getStatements();

    for (let sta of statements) {
      if (sta instanceof Empty) {
        let issue = new Issue(this, file, 1, sta.getStart());
        issues.push(issue);
      }
    }

    return issues;
  }
}