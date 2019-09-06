import {Issue} from "../../issue";
import {Position} from "../../position";
import {ABAPRule} from "../_abap_rule";
import {ABAPFile} from "../../files";
import {BasicRuleConfig} from "../_basic_rule_config";

/** Checks for redundant whitespace at the end of each line. */
export class WhitespaceEndConf extends BasicRuleConfig {
}

export class WhitespaceEnd extends ABAPRule {

  private conf = new WhitespaceEndConf();

  public getKey(): string {
    return "whitespace_end";
  }

  public getDescription(): string {
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
        const issue = new Issue({file, message: this.getDescription(), key: this.getKey(), start: new Position(i + 1, 1)});
        issues.push(issue);
      }
    }

    return issues;
  }
}