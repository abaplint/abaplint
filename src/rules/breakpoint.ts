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
    const issues: Issue[] = [];

    for (const statement of file.getStatements()) {
      if (statement.get() instanceof Statements.Break) {
        issues.push(new Issue({file, message: this.getDescription(), key: this.getKey(), start: statement.getStart()}));
      }
    }

    return issues;
  }
}