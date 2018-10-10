import {Object} from "./";
import {ParsedFile} from "../files";
import Lexer from "../abap/lexer";
import Parser from "../abap/parser";
import {Version} from "../version";
import Registry from "../registry";
import {Define} from "../abap/statements";
import {TokenNode} from "../abap/node";
import {Token} from "../abap/tokens/";
import {Statement, Unknown, MacroCall} from "../abap/statements/statement";

export abstract class ABAPObject extends Object {
  private parsed: Array<ParsedFile>;

  public constructor(name: string, devPackage: string) {
    super(name, devPackage);
    this.parsed = [];
  }

  public parseFirstPass(ver: Version, reg: Registry) {
    this.parsed = [];

    this.files.forEach((f) => {
      if (!this.skip(f.getFilename())) {
        let tokens = Lexer.run(f);
        let statements = Parser.run(tokens, ver);

        this.parsed.push(new ParsedFile(f, tokens, statements));
      }
    });

    this.parsed.forEach((f) => {
      f.getStatements().forEach((s) => {
        if (s instanceof Define) {
          reg.addMacro(s.getTokens()[1].getStr());
        }
      });
    });
  }

  public parseSecondPass(reg: Registry): Array<ParsedFile> {
    this.parsed.forEach((f) => {
      let statements: Array<Statement> = [];
      f.getStatements().forEach((s) => {
        if (s instanceof Unknown && reg.isMacro(s.getTokens()[0].getStr())) {
          statements.push(new MacroCall(this.tokensToNodes(s.getTokens())));
        } else {
          statements.push(s);
        }
      });
      f.setStatements(statements);
    });

    return this.parsed;
  }

  public getParsed(): Array<ParsedFile> {
    return this.parsed;
  }

  private tokensToNodes(tokens: Array<Token>): Array<TokenNode> {
    let ret: Array<TokenNode> = [];
    tokens.forEach((t) => {ret.push(new TokenNode("Unknown", t)); });
    return ret;
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