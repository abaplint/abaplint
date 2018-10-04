import {Issue} from "../issue";
import Position from "../position";
import {ABAPRule} from "./abap_rule";
import {ParsedFile} from "../files";

export class LineLengthConf {
  public enabled: boolean = true;
  public length: number = 120;
}

export class LineLength extends ABAPRule {

  private conf = new LineLengthConf();

  public getKey(): string {
    return "line_length";
  }

  public getDescription(): string {
    return "Reduce line length";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: LineLengthConf) {
    this.conf = conf;
  }

  public runParsed(file: ParsedFile) {
    let issues: Array<Issue> = [];

    let lines = file.getRaw().split("\n");
    for (let line = 0; line < lines.length; line++) {
      if (lines[line].length > this.conf.length) {
        let issue = new Issue(this, file, 1, new Position(line + 1, 1));
        issues.push(issue);
      }
    }

    return issues;
  }

}