import {Issue} from "../issue";
import {Position} from "../position";
import {Comment} from "../abap/2_statements/statements/_statement";
import {TypeBegin, TypeEnd} from "../abap/2_statements/statements";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";

export class StartAtTabConf extends BasicRuleConfig {
}

export class StartAtTab extends ABAPRule {

  private conf = new StartAtTabConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "start_at_tab",
      title: "Start at tab",
      shortDescription: `Checks that statements start at tabstops.`,
      extendedInformation: `https://github.com/SAP/styleguides/blob/master/clean-abap/CleanABAP.md#indent-and-snap-to-tab`,
      tags: [RuleTag.Whitespace, RuleTag.Styleguide],
      badExample: ` WRITE a.`,
      goodExample: `  WRITE a.`,
    };
  }

  private getMessage(): string {
    return "Start statement at tab position";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: StartAtTabConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    let inType = false;
    let previous: Position | undefined = undefined;
    const raw = file.getRawRows();

    for (const statement of file.getStatements()) {
      if (statement.get() instanceof Comment) {
        continue;
      } else if (statement.get() instanceof TypeBegin) {
        inType = true;
      } else if (statement.get() instanceof TypeEnd) {
        inType = false;
      } else if (inType) {
        continue;
      }

      const pos = statement.getStart();
      if (previous !== undefined && pos.getRow() === previous.getRow()) {
        continue;
      }
// just skip rows that contains tabs, this will be reported by the contains_tab rule
      if ((pos.getCol() - 1) % 2 !== 0 && raw[pos.getRow() - 1].includes("\t") === false) {
        const issue = Issue.atPosition(file, pos, this.getMessage(), this.getMetadata().key, this.conf.severity);
        issues.push(issue);
      }
      previous = pos;
    }

    return issues;
  }

}