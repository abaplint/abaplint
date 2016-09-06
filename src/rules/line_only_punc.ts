import {IRule} from "./rule";
import {File} from "../file";
import Issue from "../issue";
import Position from "../position";

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

  public run(file: File) {
    let rows = file.getRawRows();
    for (let i = 0; i < rows.length; i++) {
      let trim = rows[i].trim();
      if (trim === "." || trim === ").") {
        let issue = new Issue(this, new Position(i + 1, 0), file);
        file.add(issue);
      }
    }
  }

}