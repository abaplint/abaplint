import {Issue} from "../issue";
import * as Statements from "../abap/statements";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";

/** Detects usage of code-based breakpoints. */
export class BreakpointConf extends BasicRuleConfig {
}

export class Breakpoint extends ABAPRule {
  private conf = new BreakpointConf();

  public getKey(): string {
    return "breakpoint";
  }

  private getDescription(): string {
    return "Line contains a breakpoint.";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: BreakpointConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    for (const statement of file.getStatements()) {
      if (statement.get() instanceof Statements.Break) {
        const issue = Issue.atRow(file, statement.getStart().getRow(), this.getDescription(), this.getKey());
        issues.push(issue);
      }
    }

    return issues;
  }
}