import { Rule } from "./rule";
import File from "../file";
import Issue from "../issue";
import Position from "../position";
import * as Statements from "../statements/";

export class SevenBitAsciiConf {
  public enabled: boolean = true;
}

export class SevenBitAscii implements Rule {

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

  public run(file: File) {
    let rows = file.getRawRows();

    for (let i = 0; i < rows.length; i++) {
      if (/^[\u0000-\u007f]*$/.test(rows[i]) === false) {
        let issue = new Issue(this, new Position(i + 1, 1), file);
        file.add(issue);
      }
    }
  }
}