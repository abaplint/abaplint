import {Issue} from "../issue";
import {Position} from "../position";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {EditHelper} from "../edit_helper";

export class ContainsTabConf extends BasicRuleConfig {
  /** quick fix replace with number of spaces */
  public spaces: number = 1;
}

export class ContainsTab extends ABAPRule {

  private conf = new ContainsTabConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "contains_tab",
      title: "Code contains tab",
      shortDescription: `Checks for usage of tabs (enable to enforce spaces)`,
      extendedInformation: `
https://docs.abapopenchecks.org/checks/09/
https://github.com/SAP/styleguides/blob/master/clean-abap/CleanABAP.md#indent-and-snap-to-tab`,
      tags: [RuleTag.Whitespace, RuleTag.Quickfix, RuleTag.Styleguide],
    };
  }

  private getMessage(): string {
    return "Code can't contain tabs";
  }

  public getConfig() {
    if (this.conf.spaces === undefined) {
      this.conf.spaces = 1;
    }
    return this.conf;
  }

  public setConfig(conf: ContainsTabConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    const lines = file.getRaw().split("\n");
    lines.forEach((_, i) => {
      const tabCol = lines[i].indexOf("\t");
      if (tabCol >= 0) {
        let tabAmount = 1;
        while(lines[i].indexOf("\t", tabCol + tabAmount - 1) >= 0){
          tabAmount++;
        }
        issues.push(this.createIssue(i, tabCol, tabAmount, file));
      }
    });
    return issues;
  }

  private createIssue(line: number, tabCol: number, tabAmount: number, file: ABAPFile) {
    const tabStartPos = new Position(line + 1, tabCol + 1);
    const tabEndPos = new Position(line + 1, tabCol + tabAmount);
    const fix = EditHelper.replaceRange(file, tabStartPos, tabEndPos, " ".repeat(this.getConfig().spaces));
    return Issue.atRange(file, tabStartPos, tabEndPos, this.getMessage(), this.getMetadata().key, this.conf.severity, fix);
  }
}