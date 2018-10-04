import {Issue} from "../issue";
import Position from "../position";
import {Comment} from "../abap/statements/statement";
import {TypeBegin, TypeEnd} from "../abap/statements/";
import {ABAPRule} from "./abap_rule";
import {ParsedFile} from "../files";

export class StartAtTabConf {
  public enabled: boolean = true;
}

export class StartAtTab extends ABAPRule {

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

  public setConfig(conf: StartAtTabConf) {
    this.conf = conf;
  }

  public runParsed(file: ParsedFile) {
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
        let issue = new Issue(this, file, 1, pos);
        issues.push(issue);
      }
      previous = pos;
    }

    return issues;
  }

}