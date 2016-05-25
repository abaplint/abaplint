import { Rule } from "./rule";
import File from "../file";
import Issue from "../issue";
import Position from "../position";

export class ContainsTabConf {
  public enabled: boolean = true;
}

export class ContainsTab implements Rule {

  private conf = new ContainsTabConf();

  public get_key(): string {
    return "contains_tab";
  }

  public get_description(): string {
    return "Code contains tab";
  }

  public get_config() {
    return this.conf;
  }

  public set_config(conf) {
    this.conf = conf;
  }

  public run(file: File) {
    let lines = file.getRaw().split("\n");
    for (let line = 0; line < lines.length; line++) {
      if (/\t/.test(lines[line])) {
        let issue = new Issue(this, new Position(line + 1, 1), file);
        file.add(issue);
      }
    }
  }

}