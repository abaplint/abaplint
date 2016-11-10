import {IRule} from "./rule";
import {ParsedFile} from "../file";
import {Issue} from "../issue";
import Position from "../position";
import {Comment} from "../statements/statement";
import {TypeBegin, TypeEnd} from "../statements/";

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

  public run(file: ParsedFile) {
    let issues: Array<Issue> = [];
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
        let issue = new Issue(this, pos, file);
        issues.push(issue);
      }
      previous = pos;
    }

    return issues;
  }

}