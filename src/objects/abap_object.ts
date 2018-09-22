import {Object} from "./";
import {ParsedFile} from "../file";
import Lexer from "../abap/lexer";
import Parser from "../abap/parser";
import {Version} from "../version";
import Nesting from "../abap/nesting";

export abstract class ABAPObject extends Object {

  public constructor(name: string, devPackage: string) {
    super(name, devPackage);
  }

  public parse(ver: Version): Array<ParsedFile> {
    let parsed: Array<ParsedFile> = [];

    this.files.forEach((f) => {
      if (!this.skip(f.getFilename())) {
        let tokens = Lexer.run(f);
        let statements = Parser.run(tokens, ver);
        let root = Nesting.run(statements);

        parsed.push(new ParsedFile(f, tokens, statements, root));
      }
    });

    return parsed;
  }

  private skip(filename: string): boolean {
    // ignore global exception classes, todo?
    // the auto generated classes are crap, move logic to skip into the rules intead
    if (/zcx_.*\.clas\.abap$/.test(filename)) {
      return true;
    }

    if (!/.*\.abap$/.test(filename)) {
      return true;
    }
    return false;
  }

}