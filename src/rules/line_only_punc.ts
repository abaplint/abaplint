import {IRule} from "./rule";
import {Issue} from "../issue";
import Position from "../position";
import {ABAPObject} from "../objects";

export class LineOnlyPuncConf {
  public enabled: boolean = true;
}

export class LineOnlyPunc implements IRule {

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
        let trim = rows[i].trim();
        if (trim === "." || trim === ").") {
          let issue = new Issue(this, file, new Position(i + 1, 0));
          issues.push(issue);
        }
      }
    }

    return issues;
  }

}