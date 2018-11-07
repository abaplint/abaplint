import {Issue} from "../issue";
import Position from "../position";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";

export class LineOnlyPuncConf {
  public enabled: boolean = true;
}

export class LineOnlyPunc extends ABAPRule {

  private conf = new LineOnlyPuncConf();

  public getKey(): string {
    return "line_only_punc";
  }

  public getDescription(): string {
    return "Line contains only . or ).";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: LineOnlyPuncConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    let issues: Array<Issue> = [];

    let rows = file.getRawRows();
    for (let i = 0; i < rows.length; i++) {
      let trim = rows[i].trim();
      if (trim === "." || trim === ").") {
        let issue = new Issue({file, message: this.getDescription(), code: this.getKey(), start: new Position(i + 1, 0)});
        issues.push(issue);
      }
    }

    return issues;
  }

}