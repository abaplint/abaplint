import {IRule} from "./rule";
import {Issue} from "../issue";
import Position from "../position";
import {ABAPObject} from "../objects";

export class LineLengthConf {
  public enabled: boolean = true;
  public length: number = 120;
}

export class LineLength implements IRule {

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
      let lines = file.getRaw().split("\n");
      for (let line = 0; line < lines.length; line++) {
        if (lines[line].length > this.conf.length) {
          let issue = new Issue(this, file, new Position(line + 1, 1));
          issues.push(issue);
        }
      }
    }

    return issues;
  }

}