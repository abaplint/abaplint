import {Issue} from "../issue";
import {Position} from "../position";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IObject} from "../objects/_iobject";
import {IRule} from "./_irule";

/** Only allow characters from the 7bit ASCII set.
 * https://docs.abapopenchecks.org/checks/05/
 */
export class SevenBitAsciiConf extends BasicRuleConfig {
}

export class SevenBitAscii implements IRule {
  private conf = new SevenBitAsciiConf();

  public getMetadata() {
    return {key: "7bit_ascii"};
  }

  private getMessage(): string {
    return "Contains non 7 bit ascii character";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: SevenBitAsciiConf) {
    this.conf = conf;
  }

  public run(obj: IObject): Issue[] {
    const output: Issue[] = [];

    for (const file of obj.getFiles()) {
      if (file.getFilename().endsWith(".abap")) {
        const rows = file.getRawRows();

        for (let i = 0; i < rows.length; i++) {
          if (/^[\u0000-\u007f]*$/.test(rows[i]) === false) {
            const position = new Position(i + 1, 1);
            const issue = Issue.atPosition(file, position, this.getMessage(), this.getMetadata().key);
            output.push(issue);
          }
        }
      }
    }

    return output;
  }

}