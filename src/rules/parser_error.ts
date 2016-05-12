import { Rule } from "./rule";
import File from "../file";
import Issue from "../issue";
import Position from "../position";
import * as Statements from "../statements/";

export class ParserErrorConf {
  public enabled: boolean = true;
}

export class ParserError implements Rule {

  private conf = new ParserErrorConf();

  public get_key(): string {
    return "parser_error";
  }

  public get_description(): string {
    return "Parser error(Unknown statement)";
  }

  public get_config() {
    return this.conf;
  }

  public set_config(conf) {
    this.conf = conf;
  }

  public run(file: File) {
    let pos = new Position(0, 0);
    for (let statement of file.getStatements()) {
// only report one error per row
      if (statement instanceof Statements.Unknown
            && pos.getRow() !== statement.get_start().getRow()) {
        pos = statement.get_start();
        let issue = new Issue(this, pos, file);
        file.add(issue);
      }
    }
  }

}