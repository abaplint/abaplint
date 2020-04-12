import {Issue} from "../issue";
import {Position} from "../position";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";

/** Detects lines exceeding the provided maximum length.
 * https://github.com/SAP/styleguides/blob/master/clean-abap/CleanABAP.md#stick-to-a-reasonable-line-length
 * https://docs.abapopenchecks.org/checks/04/
 */
export class LineLengthConf extends BasicRuleConfig {
  /** Maximum line length in characters */
  public length: number = 120;
}

export class LineLength extends ABAPRule {

  private conf = new LineLengthConf();

  public getMetadata() {
    return {key: "line_length"};
  }

  private getDescription(max: string, actual: string): string {
    return "Reduce line length to max " + max + ", currently " + actual;
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: LineLengthConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    const lines = file.getRaw().split("\n");
    for (let line = 0; line < lines.length; line++) {
      lines[line] = lines[line].replace("\r", ""); // remove carriage returns
      if (lines[line].length > this.conf.length) {
        const message = this.getDescription(this.conf.length.toString(), lines[line].length.toString());
        const position = new Position(line + 1, 1);
        const issue = Issue.atPosition(file, position, message, this.getMetadata().key);
        issues.push(issue);
      }
    }

    return issues;
  }

}