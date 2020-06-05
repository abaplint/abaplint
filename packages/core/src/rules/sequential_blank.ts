import {Issue} from "../issue";
import {Position} from "../position";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";

export class SequentialBlankConf extends BasicRuleConfig {
  /** An equal or higher number of sequential blank lines will trigger a violation.
   * Example: if lines = 3, a maximum of 2 is allowed.
   */
  public lines: number = 4;
}

export class SequentialBlank extends ABAPRule {

  public static isBlankOrWhitespace(line: string): boolean {
    return /^\s*$/.test(line);
  }
  private conf = new SequentialBlankConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "sequential_blank",
      title: "Sequential blank lines",
      shortDescription: `Checks that code does not contain more than the configured number of blank lines in a row.`,
      tags: [RuleTag.Whitespace],
    };
  }

  private getMessage(): string {
    return "Remove sequential blank lines";
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
      if (SequentialBlank.isBlankOrWhitespace(rows[i])) {
        blanks++;
      } else {
        blanks = 0;
      }

      if (blanks === this.conf.lines) {
        const position = new Position(i + 1, 1);
        const issue = Issue.atPosition(file, position, this.getMessage(), this.getMetadata().key);
        issues.push(issue);
      }
    }

    return issues;
  }
}