import {IRule} from "./rule";
import {ParsedFile} from "../file";
import {Issue} from "../issue";
import Position from "../position";
import {Unknown} from "../statements/statement";

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

  public run(file: ParsedFile) {
    let issues: Array<Issue> = [];
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

    return issues;
  }

}