import {Issue} from "../issue";
import * as Statements from "../abap/2_statements/statements";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Dynamic} from "../abap/2_statements/expressions";
import {IRegistry} from "../_iregistry";
import {Version} from "../version";

export class UseNewConf extends BasicRuleConfig {
}

export class UseNew extends ABAPRule {
  private conf = new UseNewConf();

  public getMetadata() {
    return {
      key: "use_new",
      title: "Use NEW",
      quickfix: false,
      shortDescription: `Checks for deprecated CREATE OBJECT statements.`,
    };
  }

  private getMessage(): string {
    return "Use NEW #( ) to instantiate object.";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: UseNewConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, reg: IRegistry) {
    const issues: Issue[] = [];

    if (reg.getConfig().getVersion() < Version.v740sp02) {
      return [];
    }

    for (const statement of file.getStatements()) {
      if (statement.get() instanceof Statements.CreateObject) {
        if (statement.findFirstExpression(Dynamic)) {
          continue;
        }
        const issue = Issue.atPosition(file, statement.getStart(), this.getMessage(), this.getMetadata().key);
        issues.push(issue);
      }
    }

    return issues;
  }
}