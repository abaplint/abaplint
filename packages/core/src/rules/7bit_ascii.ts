import {Issue} from "../issue";
import {Position} from "../position";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IObject} from "../objects/_iobject";
import {IRule} from "./_irule";
import {IRegistry} from "../_iregistry";

export class SevenBitAsciiConf extends BasicRuleConfig {
}

export class SevenBitAscii implements IRule {
  private conf = new SevenBitAsciiConf();

  public getMetadata() {
    return {
      key: "7bit_ascii",
      title: "Check for 7bit ascii",
      shortDescription: `Only allow characters from the 7bit ASCII set.`,
      extendedInformation: `https://docs.abapopenchecks.org/checks/05/`,
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
      if (file.getFilename().endsWith(".abap")) {
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