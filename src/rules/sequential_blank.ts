import { Rule } from "./rule";
import File from "../file";
import Issue from "../issue";
import Position from "../position";
import * as Statements from "../statements/";

export class SequentialBlankConf {
  public enabled: boolean = true;
  public lines: number = 4;
}

export class SequentialBlank implements Rule {

  private conf = new SequentialBlankConf();

  public get_key(): string {
    return "sequential_blank";
  }

  public get_description(): string {
    return "Sequential blank lines";
  }

  public get_config() {
    return this.conf;
  }

  public set_config(conf) {
    this.conf = conf;
  }

  public run(file: File) {
    let rows = file.getRawRows();
    let blanks = 0;

    for (let i = 0; i < rows.length; i++) {
      if (rows[i] === "") {
        blanks++;
      } else {
        blanks = 0;
      }

      if (blanks === this.conf.lines) {
        let issue = new Issue(this, new Position(i + 1, 1), file);
        file.add(issue);
      }
    }
  }
}