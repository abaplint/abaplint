import { IRule } from "./rule";
import File from "../file";
import Issue from "../issue";
import Position from "../position";

export class WhitespaceEndConf {
  public enabled: boolean = true;
}

export class WhitespaceEnd implements IRule {

  private conf = new WhitespaceEndConf();

  public getKey(): string {
    return "whitespace_end";
  }

  public getDescription(): string {
    return "Whitespace at end of line";
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
      if (/.* $/.test(rows[i]) === true) {
        let issue = new Issue(this, new Position(i + 1, 1), file);
        file.add(issue);
      }
    }
  }
}