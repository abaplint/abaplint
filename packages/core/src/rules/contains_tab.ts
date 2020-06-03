import {Issue} from "../issue";
import {Position} from "../position";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";

export class ContainsTabConf extends BasicRuleConfig {
}

export class ContainsTab extends ABAPRule {

  private conf = new ContainsTabConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "contains_tab",
      title: "Code contains tab",
      quickfix: false,
      shortDescription: `Checks for usage of tabs (enable to enforce spaces)`,
      extendedInformation: `https://docs.abapopenchecks.org/checks/09/`,
      tags: [RuleTag.Whitespace],
    };
  }

  private getMessage(): string {
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
        const issue = Issue.atPosition(file, new Position(line + 1, index + 1), this.getMessage(), this.getMetadata().key);
        issues.push(issue);
      }
    }

    return issues;
  }

}