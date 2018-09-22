import {IRule} from "./rule";
import {ParsedFile} from "../file";
import {Issue} from "../issue";
import Position from "../position";

export class SevenBitAsciiConf {
  public enabled: boolean = true;
}

export class SevenBitAscii implements IRule {
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

  public setConfig(conf) {
    this.conf = conf;
  }

  public run(file: ParsedFile) {
    let rows = file.getRawRows();
    let output: Array<Issue> = [];

    for (let i = 0; i < rows.length; i++) {
      if (/^[\u0000-\u007f]*$/.test(rows[i]) === false) {
        let issue = new Issue(this, file, new Position(i + 1, 1));
        output.push(issue);
      }
    }

    return output;
  }
}