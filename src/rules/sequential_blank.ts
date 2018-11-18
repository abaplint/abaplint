import {Issue} from "../issue";
import {Position} from "../position";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";

export class SequentialBlankConf {
  public enabled: boolean = true;
  public lines: number = 4;
}

export class SequentialBlank extends ABAPRule {

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

  public setConfig(conf: SequentialBlankConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Array<Issue> = [];

    const rows = file.getRawRows();
    let blanks = 0;

    for (let i = 0; i < rows.length; i++) {
      if (rows[i] === "") {
        blanks++;
      } else {
        blanks = 0;
      }

      if (blanks === this.conf.lines) {
        const issue = new Issue({file, message: this.getDescription(), code: this.getKey(), start: new Position(i + 1, 1)});
        issues.push(issue);
      }
    }

    return issues;
  }
}