import { IRule } from "./rule";
import File from "../file";
import Issue from "../issue";
import {Comment} from "../statements/statement";

export class MaxOneStatementConf {
  public enabled: boolean = true;
}

export class MaxOneStatement implements IRule {

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

  public run(file: File) {
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
        let issue = new Issue(this, pos, file);
        file.add(issue);
        reported = row;
      }
      prev = row;
    }
  }

}