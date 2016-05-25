import { Rule } from "./rule";
import File from "../file";
import Position from "../position";
import Issue from "../issue";

export class Counter {
    public exporting: boolean = false;
    public other: boolean = false;
    public pos: Position;
}

export class ExportingConf {
  public enabled: boolean = true;
}

export class Exporting implements Rule {

  private conf = new ExportingConf();

  public get_key(): string {
    return "exporting";
  }

  public get_description(): string {
    return "EXPORTING can be omitted";
  }

  public get_config() {
    return this.conf;
  }

  public set_config(conf) {
    this.conf = conf;
  }

  private last_char(s: string): string {
    return s.charAt(s.length - 1);
  }

  private first_char(s: string): string {
    return s.charAt(0);
  }

  public run(file: File) {
    for (let statement of file.getStatements()) {
      let current = new Counter();
      let stack: Array<Counter> = [];

      for (let token of statement.getTokens()) {
        if (this.last_char(token.getStr()) === "(") {
          stack.push(current);
          current = new Counter();
        } else if (this.first_char(token.getStr()) === ")") {
          if (current.exporting === true && current.other === false) {
            let issue = new Issue(this, current.pos, file);
            file.add(issue);
          }
          current = stack.pop();
          if (current === undefined) {
            current = new Counter();
          }
        } else if (token.getStr() === "EXPORTING") {
          current.exporting = true;
          current.pos = token.getPos();
        } else if (token.getStr() === "IMPORTING"
            || token.getStr() === "RECEIVING"
            || token.getStr() === "EXCEPTIONS"
            || token.getStr() === "CHANGING") {
          current.other = true;
        }
      }
    }
  }

}