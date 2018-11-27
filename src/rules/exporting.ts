import {Position} from "../position";
import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";

export class Counter {
  public exporting: boolean = false;
  public other: boolean = false;
  public pos: Position;
}

export class ExportingConf {
  public enabled: boolean = true;
}

export class Exporting extends ABAPRule {

  private conf = new ExportingConf();

  public getKey(): string {
    return "exporting";
  }

  public getDescription(): string {
    return "EXPORTING can be omitted";
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    for (const statement of file.getStatements()) {
      let current: Counter | undefined = new Counter();
      const stack: Counter[] = [];

      for (const token of statement.getTokens()) {
        if (this.lastChar(token.getStr()) === "(") {
          stack.push(current);
          current = new Counter();
        } else if (this.firstChar(token.getStr()) === ")") {
          if (current.exporting === true && current.other === false) {
            const issue = new Issue({file, message: this.getDescription(), code: this.getKey(), start: current.pos});
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

  public setConfig(conf: ExportingConf) {
    this.conf = conf;
  }

  private lastChar(s: string): string {
    return s.charAt(s.length - 1);
  }

  private firstChar(s: string): string {
    return s.charAt(0);
  }

}