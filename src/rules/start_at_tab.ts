import {IRule} from "./rule";
import {Issue} from "../issue";
import Position from "../position";
import {Comment} from "../abap/statements/statement";
import {TypeBegin, TypeEnd} from "../abap/statements/";
import {ABAPObject} from "../objects";

export class StartAtTabConf {
  public enabled: boolean = true;
}

export class StartAtTab implements IRule {

  private conf = new StartAtTabConf();

  public getKey(): string {
    return "start_at_tab";
  }

  public getDescription(): string {
    return "Start statement at tab position";
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
      let inType = false;
      let previous: Position = undefined;

      for (let statement of file.getStatements()) {
        if (statement instanceof Comment) {
          continue;
        } else if (statement instanceof TypeBegin) {
          inType = true;
        } else if (statement instanceof TypeEnd) {
          inType = false;
        } else if (inType) {
          continue;
        }

        let pos = statement.getStart();
        if (previous !== undefined && pos.getRow() === previous.getRow()) {
          continue;
        }
        if ((pos.getCol() - 1) % 2 !== 0) {
          let issue = new Issue(this, file, pos);
          issues.push(issue);
        }
        previous = pos;
      }
    }

    return issues;
  }

}