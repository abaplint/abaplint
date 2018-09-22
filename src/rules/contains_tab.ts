import {IRule} from "./rule";
import {Issue} from "../issue";
import Position from "../position";
import {ABAPObject} from "../objects";

export class ContainsTabConf {
  public enabled: boolean = true;
}

export class ContainsTab implements IRule {

  private conf = new ContainsTabConf();

  public getKey(): string {
    return "contains_tab";
  }

  public getDescription(): string {
    return "Code contains tab";
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
        if (/\t/.test(lines[line])) {
          let issue = new Issue(this, file, new Position(line + 1, 1));
          issues.push(issue);
        }
      }
    }

    return issues;
  }

}