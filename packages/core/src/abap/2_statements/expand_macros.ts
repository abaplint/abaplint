import * as Statements from "./statements";
import * as Tokens from "../1_lexer/tokens";
import {MacroContent, Comment, Unknown, MacroCall} from "./statements/_statement";
import {StatementNode} from "../nodes/statement_node";
import {Token} from "../1_lexer/tokens/_token";
import {TokenNode} from "../nodes/token_node";
import {Version} from "../../version";
import {StatementParser} from "./statement_parser";
import {ILexerResult} from "../1_lexer/lexer_result";
import {MemoryFile} from "../../files/memory_file";

class Macros {
  private readonly macros: {[index: string]: StatementNode[]};

  public constructor(globalMacros: readonly string[]) {
    this.macros = {};
    for (const m of globalMacros) {
      this.macros[m.toUpperCase()] = [];
    }
  }

  public addMacro(name: string, contents: StatementNode[]): void {
    if (this.isMacro(name)) {
      return;
    }
    this.macros[name.toUpperCase()] = contents;
  }

  public getContents(name: string): StatementNode[] | undefined {
    return this.macros[name.toUpperCase()];
  }

  public isMacro(name: string): boolean {
    if (this.macros[name.toUpperCase()]) {
      return true;
    }
    return false;
  }
}

export class ExpandMacros {
  private readonly macros: Macros;
  private readonly version: Version;

  public constructor(globalMacros: readonly string[], version: Version) {
    this.macros = new Macros(globalMacros);
    this.version = version;
  }

  public find(statements: StatementNode[]) {
    let name: string | undefined = undefined;
    let contents: StatementNode[] = [];

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      if (statement.get() instanceof Statements.Define) {
        // todo, will this break if first token is a pragma?
        name = statement.getTokens()[1].getStr();
        contents = [];
      } else if (name) {
        if (statement.get() instanceof Statements.EndOfDefinition) {
          this.macros.addMacro(name, contents);
          name = undefined;
        } else if (!(statement.get() instanceof Comment)) {
          statements[i] = new StatementNode(new MacroContent()).setChildren(this.tokensToNodes(statement.getTokens()));
          contents.push(statements[i]);
        }
      }
    }
  }

  public handleMacros(statements: StatementNode[]): StatementNode[] {
    const result: StatementNode[] = [];

    for (const statement of statements) {
      if (statement.get() instanceof Unknown) {
        const macroName = this.findName(statement.getTokens());
        if (macroName && this.macros.isMacro(macroName)) {
          this.expandContents(macroName);

          result.push(new StatementNode(new MacroCall()).setChildren(this.tokensToNodes(statement.getTokens())));
          continue;
        }
      }
      result.push(statement);
    }

    return result;
  }

  //////////////

  private expandContents(name: string): readonly StatementNode[] {
    const contents = this.macros.getContents(name);
    if (contents === undefined || contents.length === 0) {
      return [];
    }

    const tokens: Token[] = [];
    for (const c of contents) {
      for (const t of c.getTokens()) {
        tokens.push(t);
      }
    }

    const lexerResult: ILexerResult = {
      file: new MemoryFile("expand_macros.abap.prog", ""),
      tokens,
    };

    const result = new StatementParser(this.version).run([lexerResult], []);

//    console.dir(result[0].statements);
    return result[0].statements;
  }

  private findName(tokens: readonly Token[]): string | undefined {
    let macroName: string | undefined = undefined;
    let previous: Token | undefined = undefined;
    for (const i of tokens) {
      if (previous && previous?.getEnd().getCol() !== i.getStart().getCol()) {
        break;
      } else if (i instanceof Tokens.Identifier || i.getStr() === "-") {
        if (macroName === undefined) {
          macroName = i.getStr();
        } else {
          macroName += i.getStr();
        }
      } else if (i instanceof Tokens.Pragma) {
        continue;
      } else {
        break;
      }
      previous = i;
    }
    return macroName;
  }

  private tokensToNodes(tokens: readonly Token[]): TokenNode[] {
    const ret: TokenNode[] = [];

    for (const t of tokens) {
      ret.push(new TokenNode(t));
    }

    return ret;
  }

}