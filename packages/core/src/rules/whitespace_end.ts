import {Issue} from "../issue";
import {Position} from "../position";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import {EditHelper} from "../edit_helper";
import {IRuleMetadata, RuleTag} from "./_irule";

export class WhitespaceEndConf extends BasicRuleConfig {
}

export class WhitespaceEnd extends ABAPRule {

  private conf = new WhitespaceEndConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "whitespace_end",
      title: "Whitespace at end of line",
      shortDescription: `Checks for redundant whitespace at the end of each line.`,
      tags: [RuleTag.Whitespace, RuleTag.Quickfix],
    };
  }

  private getMessage(): string {
    return "Remove whitespace at end of line";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: WhitespaceEndConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    const rows = file.getRawRows();

    for (let i = 0; i < rows.length; i++) {
      if (rows[i].endsWith(" ") || rows[i].endsWith(" \r")) {
        const match = / +\r?$/.exec(rows[i]);
        const start = new Position(i + 1, match!.index + 1);
        const end = new Position(i + 1, rows[i].length + 1);
        const fix = EditHelper.deleteRange(file, start, end);
        const issue = Issue.atRange(file, start, end, this.getMessage(), this.getMetadata().key, this.conf.severity, fix);
        issues.push(issue);
      }
    }

    return issues;
  }
}