import {Issue} from "../issue";
import * as Statements from "../abap/statements";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";

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

  public setConfig(conf: BreakpointConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    let issues: Array<Issue> = [];

    for (let statement of file.getStatements()) {
      if (statement instanceof Statements.Break) {
        issues.push(new Issue({rule: this, file, message: 1, start: statement.getStart()}));
      }
    }

    return issues;
  }
}