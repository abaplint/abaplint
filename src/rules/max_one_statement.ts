import { Rule } from "./rule";
import File from "../file";
import { Token } from "../tokens/";
import Issue from "../issue";
import * as Statements from "../statements/";

export class MaxOneStatementConf {
  public enabled: boolean = true;
}

export class MaxOneStatement implements Rule {

  private conf = new MaxOneStatementConf();

  public get_key(): string {
    return "max_one_statement";
  }

  public get_description(): string {
    return "Max one statement per line";
  }

  public get_config() {
    return this.conf;
  }

  public set_config(conf) {
    this.conf = conf;
  }

  public run(file: File) {
    let prev: number = 0;
    let reported: number = 0;
    for (let statement of file.getStatements()) {
      let term = statement.get_terminator();
      if (statement instanceof Statements.Comment || term === ",") {
        continue;
      }

      let pos = statement.get_start();
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