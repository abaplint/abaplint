import {Issue} from "../issue";
import {Comment} from "../abap/2_statements/statements/_statement";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";

/** Chekcks that each line contains only a single statement.
 * https://github.com/SAP/styleguides/blob/master/clean-abap/CleanABAP.md#no-more-than-one-statement-per-line
 * https://docs.abapopenchecks.org/checks/11/
 */
export class MaxOneStatementConf extends BasicRuleConfig {
}

export class MaxOneStatement extends ABAPRule {

  private conf = new MaxOneStatementConf();

  public getKey(): string {
    return "max_one_statement";
  }

  private getDescription(): string {
    return "Only one statement is allowed per line";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: MaxOneStatementConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    let prev: number = 0;
    let reported: number = 0;
    for (const statement of file.getStatements()) {
      const term = statement.getTerminator();
      if (statement.get() instanceof Comment || term === ",") {
        continue;
      }

      const pos = statement.getStart();
      const row = pos.getRow();
      if (prev === row && row !== reported) {
        const issue = Issue.atPosition(file, pos, this.getDescription(), this.getKey());
        issues.push(issue);
        reported = row;
      }
      prev = row;
    }

    return issues;
  }

}