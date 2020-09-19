import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import {RuleTag} from "./_irule";

export class LineLengthConf extends BasicRuleConfig {
  /** Maximum line length in characters, trailing whitespace ignored */
  public length: number = 120;
}

export class LineLength extends ABAPRule {

  private conf = new LineLengthConf();

  public getMetadata() {
    return {
      key: "line_length",
      title: "Line length",
      shortDescription: `Detects lines exceeding the provided maximum length.`,
      extendedInformation: `https://github.com/SAP/styleguides/blob/master/clean-abap/CleanABAP.md#stick-to-a-reasonable-line-length
https://docs.abapopenchecks.org/checks/04/`,
      tags: [RuleTag.Styleguide],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: LineLengthConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];
    // maximum line length in abap files
    const maxLineLength: number = 255;

    file.getRawRows().forEach((row, rowIndex) => {
      row = row.replace("\r", "");
      let message = "";
      if (row.length > maxLineLength) {
        message = `Maximum allowed line length of ${maxLineLength} exceeded, currently  ${row.length}`;
      } else if (row.length > this.conf.length) {
        message = `Reduce line length to max ${this.conf.length}, currently ${row.length}`;
      } else {
        return;
      }
      issues.push(Issue.atRow(file, rowIndex + 1, message, this.getMetadata().key, this.conf.severity));
    });
    return issues;
  }

}