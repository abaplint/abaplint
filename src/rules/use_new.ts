import {Issue} from "../issue";
import * as Statements from "../abap/statements";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Dynamic} from "../abap/expressions";
import {Registry} from "../registry";
import {Version} from "../version";

/** Checks for deprecated CREATE OBJECT statements. */
export class UseNewConf extends BasicRuleConfig {
}

export class UseNew extends ABAPRule {
  private conf = new UseNewConf();

  public getKey(): string {
    return "use_new";
  }

  private getDescription(): string {
    return "Use NEW #( ) to instantiate object.";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: UseNewConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, reg: Registry) {
    const issues: Issue[] = [];

    if (reg.getConfig().getVersion() < Version.v740sp02) {
      return [];
    }

    for (const statement of file.getStatements()) {
      if (statement.get() instanceof Statements.CreateObject) {
        if (statement.findFirstExpression(Dynamic)) {
          continue;
        }
        issues.push(new Issue({file, message: this.getDescription(), key: this.getKey(), start: statement.getStart()}));
      }
    }

    return issues;
  }
}