import {Comment, MacroContent} from "../abap/statements/statement";
import {IncludeType} from "../abap/statements/include_type";
import {Issue} from "../issue";
import {ABAPRule} from "./abap_rule";

export class IndentationConf {
  public enabled: boolean = true;
}

export class Indentation extends ABAPRule {

  private conf = new IndentationConf();

  public getKey(): string {
    return "indentation";
  }

  public getDescription(): string {
    return "Bad indentation";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf) {
    this.conf = conf;
  }

  public runParsed(file): Array<Issue> {
    let issues: Array<Issue> = [];

    let current = 0;
    let prev;

    for (let statement of file.getStatements()) {
      if (statement instanceof Comment
          || statement instanceof MacroContent
          || statement instanceof IncludeType) {
        continue;
      }

      current = current + statement.indentationStart(prev);
      if (statement.indentationSetStart() > -1) {
        current = statement.indentationSetStart();
      }

      let first = statement.getTokens()[0];

      if (first.getCol() !== current + 1) {
        issues.push(new Issue(this, file, first.getPos()));
// one finding per file, pretty printer should fix everything?
        return issues;
      }

      current = current + statement.indentationEnd(prev);
      if (statement.indentationSetEnd() > -1) {
        current = statement.indentationSetEnd();
      }

      prev = statement;
    }

    return issues;
  }

}