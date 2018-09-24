import {Issue} from "../issue";
import * as Statements from "../abap/statements";
import {ABAPRule} from "./abap_rule";

export class BreakpointConf {
  public enabled: boolean = true;
}

export class Breakpoint extends ABAPRule {
  private conf = new BreakpointConf();

  public getKey(): string {
    return "breakpoint";
  }

  public getDescription(): string {
    return "Contains breakpoint";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf) {
    this.conf = conf;
  }

  public runParsed(file) {
    let issues: Array<Issue> = [];

    for (let statement of file.getStatements()) {
      if (statement instanceof Statements.Break) {
        issues.push(new Issue(this, file, statement.getStart()));
      }
    }

    return issues;
  }
}