import {Issue} from "../../issue";
import {Position} from "../../position";
import {ABAPRule} from "../_abap_rule";
import {ABAPFile} from "../../files";
import {BasicRuleConfig} from "../_basic_rule_config";

export class WhitespaceEndConf extends BasicRuleConfig {
}

export class WhitespaceEnd extends ABAPRule {

  private conf = new WhitespaceEndConf();

  public getMetadata() {
    return {
      key: "whitespace_end",
      title: "Whitespace at end of line",
      quickfix: false,
      shortDescription: `Checks for redundant whitespace at the end of each line.`,
    };
  }

  private getMessage(): string {
    return "Remove whitespace at end of line.";
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
      if (rows[i].endsWith(" ")) {
        const position = new Position(i + 1, 1);
        const issue = Issue.atPosition(file, position, this.getMessage(), this.getMetadata().key);
        issues.push(issue);
      }
    }

    return issues;
  }
}