import {Issue} from "../issue";
import {Position} from "../position";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";

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

  public runParsed(file: ABAPFile) {
    const issues: Array<Issue> = [];

    const lines = file.getRaw().split("\n");
    for (let line = 0; line < lines.length; line++) {
      if (/\t/.test(lines[line])) {
        const issue = new Issue({file, message: this.getDescription(), code: this.getKey(), start: new Position(line + 1, 1)});
        issues.push(issue);
      }
    }

    return issues;
  }

}