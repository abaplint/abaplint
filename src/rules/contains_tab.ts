import {Issue} from "../issue";
import Position from "../position";
import {ABAPRule} from "./abap_rule";
import {ParsedFile} from "../files";

export class ContainsTabConf {
  public enabled: boolean = true;
}

export class ContainsTab extends ABAPRule {

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

  public setConfig(conf: ContainsTabConf) {
    this.conf = conf;
  }

  public runParsed(file: ParsedFile) {
    let issues: Array<Issue> = [];

    let lines = file.getRaw().split("\n");
    for (let line = 0; line < lines.length; line++) {
      if (/\t/.test(lines[line])) {
        let issue = new Issue(this, file, 1, new Position(line + 1, 1));
        issues.push(issue);
      }
    }

    return issues;
  }

}