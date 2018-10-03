import {Issue} from "../issue";
import Position from "../position";
import {ABAPRule} from "./abap_rule";
import {ParsedFile} from "../files";

export class WhitespaceEndConf {
  public enabled: boolean = true;
}

export class WhitespaceEnd extends ABAPRule {

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

  public setConfig(conf: WhitespaceEndConf) {
    this.conf = conf;
  }

  public runParsed(file: ParsedFile) {
    let issues: Array<Issue> = [];

    let rows = file.getRawRows();

    for (let i = 0; i < rows.length; i++) {
      if (/.* $/.test(rows[i]) === true) {
        let issue = new Issue(this, file, 1, new Position(i + 1, 1));
        issues.push(issue);
      }
    }

    return issues;
  }
}