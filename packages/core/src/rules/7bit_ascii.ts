import {Issue} from "../issue";
import {Position} from "../position";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IObject} from "../objects/_iobject";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {IRegistry} from "../_iregistry";

export class SevenBitAsciiConf extends BasicRuleConfig {
}

export class SevenBitAscii implements IRule {
  private conf = new SevenBitAsciiConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "7bit_ascii",
      title: "Check for 7bit ascii",
      shortDescription: `Only allow characters from the 7bit ASCII set.`,
      extendedInformation: `https://docs.abapopenchecks.org/checks/05/

https://help.sap.com/doc/abapdocu_750_index_htm/7.50/en-US/abencharacter_set_guidl.htm

Checkes files with extensions ".abap" and ".asddls"`,
      tags: [RuleTag.SingleFile],
      badExample: `WRITE '뽑'.`,
      goodExample: `WRITE cl_abap_conv_in_ce=>uccp( 'BF51' ).`,
    };
  }

  public initialize(_reg: IRegistry) {
    return this;
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
      const filename = file.getFilename();
      if (filename.endsWith(".abap") || filename.endsWith(".asddls")) {
        const rows = file.getRawRows();

        for (let i = 0; i < rows.length; i++) {
          const found = /[\u007f-\uffff]/.exec(rows[i]);
          if (found !== null) {
            const column = found.index + 1;
            const start = new Position(i + 1, column);
            const end = new Position(i + 1, column + 1);
            const message = "Contains non 7 bit ascii character";
            const issue = Issue.atRange(file, start, end, message, this.getMetadata().key, this.conf.severity);
            output.push(issue);
          }

          // method getRawRows() splits by newline, so the carraige return
          // should always be last character if present
          const carriage = /\r.+$/.exec(rows[i]);
          if (carriage !== null) {
            const column = carriage.index + 1;
            const start = new Position(i + 1, column);
            const end = new Position(i + 1, column + 1);
            const message = "Dangling carriage return";
            const issue = Issue.atRange(file, start, end, message, this.getMetadata().key, this.conf.severity);
            output.push(issue);
          }

        }
      }
    }

    return output;
  }

}