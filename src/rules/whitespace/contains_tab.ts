import {Issue} from "../../issue";
import {Position} from "../../position";
import {ABAPRule} from "../_abap_rule";
import {ABAPFile} from "../../files";
import {BasicRuleConfig} from "../_basic_rule_config";

/** Checks for usage of tabs (enable to enforce spaces). */
export class ContainsTabConf extends BasicRuleConfig {
}

export class ContainsTab extends ABAPRule {

  private conf = new ContainsTabConf();

  public getKey(): string {
    return "contains_tab";
  }

  private getDescription(): string {
    return "Code can't contain tabs.";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: ContainsTabConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    const lines = file.getRaw().split("\n");
    for (let line = 0; line < lines.length; line++) {
      const index = lines[line].indexOf("\t");
      if (index >= 0) {
        const issue = new Issue({
          file,
          message: this.getDescription(),
          key: this.getKey(),
          start: new Position(line + 1, index + 1),
          end: new Position(line + 1, index + 2),
        });
        issues.push(issue);
      }
    }

    return issues;
  }

}