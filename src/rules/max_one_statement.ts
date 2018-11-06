import {Issue} from "../issue";
import {Comment} from "../abap/statements/_statement";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";

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

  public setConfig(conf: MaxOneStatementConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    let issues: Array<Issue> = [];

    let prev: number = 0;
    let reported: number = 0;
    for (let statement of file.getStatements()) {
      let term = statement.getTerminator();
      if (statement.get() instanceof Comment || term === ",") {
        continue;
      }

      let pos = statement.getStart();
      let row = pos.getRow();
      if (prev === row && row !== reported) {
        let issue = new Issue({file, message: this.getDescription(), start: pos});
        issues.push(issue);
        reported = row;
      }
      prev = row;
    }

    return issues;
  }

}