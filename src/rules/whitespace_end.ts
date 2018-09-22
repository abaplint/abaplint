import {IRule} from "./rule";
import {Issue} from "../issue";
import Position from "../position";
import {ABAPObject} from "../objects";

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

  public run(obj) {
    if (!(obj instanceof ABAPObject)) {
      return [];
    }

    let abap = obj as ABAPObject;
    let issues: Array<Issue> = [];

    for (let file of abap.getParsed()) {
      let rows = file.getRawRows();

      for (let i = 0; i < rows.length; i++) {
        if (/.* $/.test(rows[i]) === true) {
          let issue = new Issue(this, file, new Position(i + 1, 1));
          issues.push(issue);
        }
      }
    }

    return issues;
  }
}