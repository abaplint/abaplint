import {AbstractObject} from "./_abstract_object";
import {ABAPFile} from "../files";
import {Lexer} from "../abap/lexer";
import {StatementParser} from "../abap/statement_parser";
import {StructureParser} from "../abap/structure_parser";
import {Version} from "../version";
import {Registry} from "../registry";
import {Define} from "../abap/statements";
import {TokenNode, StatementNode} from "../abap/nodes/";
import {Token} from "../abap/tokens/_token";
import {Unknown, MacroCall} from "../abap/statements/_statement";
import {Issue} from "../issue";

export abstract class ABAPObject extends AbstractObject {
  private parsed: Array<ABAPFile>;

  public constructor(name: string) {
    super(name);
    this.parsed = [];
  }

  public parseFirstPass(ver: Version, reg: Registry) {
    this.parsed = [];

    this.files.forEach((f) => {
      if (/.*\.abap$/.test(f.getFilename())) {
        let tokens = Lexer.run(f);
        let statements = StatementParser.run(tokens, ver);
        this.parsed.push(new ABAPFile(f, tokens, statements));
      }
    });

    this.parsed.forEach((f) => {
      f.getStatements().forEach((s) => {
        if (s.get() instanceof Define) {
          reg.addMacro(s.getTokens()[1].getStr());
        }
      });
    });
  }

  public parseSecondPass(reg: Registry): Issue[] {
    this.parsed.forEach((f) => {
      let statements: StatementNode[] = [];
      f.getStatements().forEach((s) => {
        if (s.get() instanceof Unknown && reg.isMacro(s.getTokens()[0].getStr())) {
          statements.push(new StatementNode(new MacroCall()).setChildren(this.tokensToNodes(s.getTokens())));
        } else {
          statements.push(s);
        }
      });
      f.setStatements(statements);
    });

    let ret: Issue[] = [];
    this.parsed.forEach((f) => {
      let result = StructureParser.run(f);
      f.setStructure(result.node);
      ret = ret.concat(result.issues);
    });

    return ret;
  }

  public getParsedFiles(): Array<ABAPFile> {
    return this.parsed;
  }

  private tokensToNodes(tokens: Array<Token>): Array<TokenNode> {
    let ret: Array<TokenNode> = [];
    tokens.forEach((t) => {ret.push(new TokenNode(t)); });
    return ret;
  }

}