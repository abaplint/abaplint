import {Issue} from "../issue";
import {Comment} from "../abap/statements/statement";
import {ABAPRule} from "./abap_rule";

export class MaxOneStatementConf {
  public enabled: boolean = true;
}

export class MaxOneStatement extends ABAPRule {

  private conf = new MaxOneStatementConf();

  public getKey(): string {
    return "max_one_statement";
  }

  public getDescription(): string {
    return "Max one statement per line";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf) {
    this.conf = conf;
  }

  public runParsed(file) {
    let issues: Array<Issue> = [];

    let prev: number = 0;
    let reported: number = 0;
    for (let statement of file.getStatements()) {
      let term = statement.getTerminator();
      if (statement instanceof Comment || term === ",") {
        continue;
      }

      let pos = statement.getStart();
      let row = pos.getRow();
      if (prev === row && row !== reported) {
        let issue = new Issue(this, file, pos);
        issues.push(issue);
        reported = row;
      }
      prev = row;
    }

    return issues;
  }

}