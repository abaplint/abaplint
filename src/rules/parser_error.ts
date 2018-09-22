import {IRule} from "./rule";
import {Issue} from "../issue";
import Position from "../position";
import {Unknown} from "../abap/statements/statement";
import {ABAPObject} from "../objects";

export class ParserErrorConf {
  public enabled: boolean = true;
}

export class ParserError implements IRule {

  private conf = new ParserErrorConf();

  public getKey(): string {
    return "parser_error";
  }

  public getDescription(): string {
    return "Parser error(Unknown statement)";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf) {
    this.conf = conf;
  }

  public run(obj) {
    if (!(obj instanceof ABAPObject)) {
      return [];
    }

    let abap = obj as ABAPObject;
    let issues: Array<Issue> = [];

    for (let file of abap.getParsed()) {
      let pos = new Position(0, 0);
      for (let statement of file.getStatements()) {
// only report one error per row
        if (statement instanceof Unknown
              && pos.getRow() !== statement.getStart().getRow()) {
          pos = statement.getStart();
          let issue = new Issue(this, file, pos);
          issues.push(issue);
        }
      }
    }

    return issues;
  }

}