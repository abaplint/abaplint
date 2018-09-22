import {IRule} from "./rule";
import {ParsedFile} from "../file";
import {Issue} from "../issue";
import Position from "../position";

export class SequentialBlankConf {
  public enabled: boolean = true;
  public lines: number = 4;
}

export class SequentialBlank implements IRule {

  private conf = new SequentialBlankConf();

  public getKey(): string {
    return "sequential_blank";
  }

  public getDescription(): string {
    return "Sequential blank lines";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf) {
    this.conf = conf;
  }

  public run(file: ParsedFile) {
    let issues: Array<Issue> = [];
    let rows = file.getRawRows();
    let blanks = 0;

    for (let i = 0; i < rows.length; i++) {
      if (rows[i] === "") {
        blanks++;
      } else {
        blanks = 0;
      }

      if (blanks === this.conf.lines) {
        let issue = new Issue(this, file, new Position(i + 1, 1));
        issues.push(issue);
      }
    }

    return issues;
  }
}