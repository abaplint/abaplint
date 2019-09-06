import {Issue} from "../../issue";
import {Position} from "../../position";
import {ABAPRule} from "../_abap_rule";
import {ABAPFile} from "../../files";
import {BasicRuleConfig} from "../_basic_rule_config";

/** Checks that code does not contain more than the configured number of blank lines in a row. */
export class SequentialBlankConf extends BasicRuleConfig {
  /** The maximum number of allowed blank lines in a row */
  public lines: number = 4;
}

export class SequentialBlank extends ABAPRule {

  private conf = new SequentialBlankConf();

  public getKey(): string {
    return "sequential_blank";
  }

  public getDescription(): string {
    return "Remove sequential blank lines.";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: SequentialBlankConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    const rows = file.getRawRows();
    let blanks = 0;

    for (let i = 0; i < rows.length; i++) {
      if (rows[i] === "") {
        blanks++;
      } else {
        blanks = 0;
      }

      if (blanks === this.conf.lines) {
        const issue = new Issue({file, message: this.getDescription(), key: this.getKey(), start: new Position(i + 1, 1)});
        issues.push(issue);
      }
    }

    return issues;
  }
}