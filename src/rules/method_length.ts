import {Issue} from "../issue";
import {Comment, Empty} from "../abap/statements/_statement";
import * as Statements from "../abap/statements";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {Position} from "../position";

export class MethodLengthConf {
  public enabled: boolean = true;
  public statements: number = 100;
}

export class MethodLength extends ABAPRule {

  private conf = new MethodLengthConf();

  public getKey(): string {
    return "method_length";
  }

  public getDescription(): string {
    return "Method length, number of statements";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: MethodLengthConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Array<Issue> = [];
    let length: number = 0;
    let pos: Position | undefined = undefined;
    let method: boolean = false;

    for (const stat of file.getStatements()) {
      const type = stat.get();
      if (type instanceof Statements.Method) {
        pos = stat.getFirstToken().get().getPos();
        method = true;
        length = 0;
      } else if (type instanceof Statements.Endmethod) {
        if (length > this.conf.statements) {
          const issue = new Issue({file, message: "Reduce method length, " + length + " statements", code: this.getKey(), start: pos});
          issues.push(issue);
        }
        method = false;
      } else if (method === true
          && !(type instanceof Comment)
          && !(type instanceof Empty)) {
        length = length + 1;
      }
    }

    return issues;
  }

}