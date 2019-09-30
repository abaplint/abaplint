import {Issue} from "../issue";
import {Position} from "../position";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";

/** Only allow characters from the 7bit ASCII set. */
export class SevenBitAsciiConf extends BasicRuleConfig {
}

export class SevenBitAscii extends ABAPRule {
  private conf = new SevenBitAsciiConf();

  public getKey(): string {
    return "7bit_ascii";
  }

  public getDescription(): string {
    return "Contains non 7 bit ascii character";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: SevenBitAsciiConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const output: Issue[] = [];

    const rows = file.getRawRows();

    for (let i = 0; i < rows.length; i++) {
      if (/^[\u0000-\u007f]*$/.test(rows[i]) === false) {
        const issue = new Issue({file, message: this.getDescription(), key: this.getKey(), start: new Position(i + 1, 1)});
        output.push(issue);
      }
    }

    return output;
  }
}