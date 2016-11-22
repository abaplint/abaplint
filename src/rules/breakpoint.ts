import {IRule} from "./rule";
import {ParsedFile} from "../file";
import {Issue} from "../issue";
import * as Statements from "../statements";

export class BreakpointConf {
  public enabled: boolean = true;
}

export class Breakpoint implements IRule {
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

  public run(file: ParsedFile) {
    let issues: Array<Issue> = [];

    for (let statement of file.getStatements()) {
      if (statement instanceof Statements.Break) {
        issues.push(new Issue(this, statement.getStart(), file));
      }
    }

    return issues;
  }
}