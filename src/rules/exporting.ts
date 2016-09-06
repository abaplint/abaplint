import {IRule} from "./rule";
import {ParsedFile} from "../file";
import Position from "../position";
import {Issue} from "../issue";

export class Counter {
    public exporting: boolean = false;
    public other: boolean = false;
    public pos: Position;
}

export class ExportingConf {
  public enabled: boolean = true;
}

export class Exporting implements IRule {

  private conf = new ExportingConf();

  public getKey(): string {
    return "exporting";
  }

  public getDescription(): string {
    return "EXPORTING can be omitted";
  }

  public run(file: ParsedFile) {
    let issues: Array<Issue> = [];

    for (let statement of file.getStatements()) {
      let current = new Counter();
      let stack: Array<Counter> = [];

      for (let token of statement.getTokens()) {
        if (this.lastChar(token.getStr()) === "(") {
          stack.push(current);
          current = new Counter();
        } else if (this.firstChar(token.getStr()) === ")") {
          if (current.exporting === true && current.other === false) {
            let issue = new Issue(this, current.pos, file);
            issues.push(issue);
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

    return issues;
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf) {
    this.conf = conf;
  }

  private lastChar(s: string): string {
    return s.charAt(s.length - 1);
  }

  private firstChar(s: string): string {
    return s.charAt(0);
  }

}