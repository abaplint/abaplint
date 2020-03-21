import {Issue} from "../issue";
import * as Statements from "../abap/2_statements/statements";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Dynamic} from "../abap/2_statements/expressions";
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
        const issue = Issue.atPosition(file, statement.getStart(), this.getDescription(), this.getKey());
        issues.push(issue);
      }
    }

    return issues;
  }
}