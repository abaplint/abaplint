import {IRule} from "./rule";
import {Comment, MacroContent} from "../abap/statements/statement";
import {IncludeType} from "../abap/statements/include_type";
import {Issue} from "../issue";
import {ABAPObject} from "../objects";

export class IndentationConf {
  public enabled: boolean = true;
}

export class Indentation implements IRule {

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

  public run(obj): Array<Issue> {
    if (!(obj instanceof ABAPObject)) {
      return [];
    }

    let abap = obj as ABAPObject;
    let issues: Array<Issue> = [];

    for (let file of abap.getParsed()) {
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
    }

    return issues;
  }

}