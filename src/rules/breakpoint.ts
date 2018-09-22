import {IRule} from "./rule";
import {Issue} from "../issue";
import * as Statements from "../abap/statements";
import {ABAPObject} from "../objects";

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

  public run(obj) {
    if (!(obj instanceof ABAPObject)) {
      return [];
    }

    let abap = obj as ABAPObject;
    let issues: Array<Issue> = [];

    for (let file of abap.getParsed()) {
      for (let statement of file.getStatements()) {
        if (statement instanceof Statements.Break) {
          issues.push(new Issue(this, file, statement.getStart()));
        }
      }
    }

    return issues;
  }
}