import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import {ExecSQL} from "../abap/statements";

export class NoExecSQLConf extends BasicRuleConfig {
}

export class NoExecSQL extends ABAPRule {

  private conf = new NoExecSQLConf();

  public getKey(): string {
    return "no_exec_sql";
  }

  public getDescription(): string {
    return "No EXEC SQL";
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    for (const statement of file.getStatements()) {
      if (statement instanceof ExecSQL) {
        const start = statement.getFirstToken().getPos();
        const issue = new Issue({file, message: this.getDescription(), key: this.getKey(), start});
        issues.push(issue);
      }
    }

    return issues;
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: NoExecSQLConf) {
    this.conf = conf;
  }

}