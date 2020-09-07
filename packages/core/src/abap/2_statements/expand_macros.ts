import * as Statements from "./statements";
import * as Tokens from "../1_lexer/tokens";
import {MacroContent, Comment, Unknown, MacroCall} from "./statements/_statement";
import {StatementNode} from "../nodes/statement_node";
import {Token} from "../1_lexer/tokens/_token";
import {TokenNode} from "../nodes/token_node";

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

  public isMacro(name: string): boolean {
    if (this.macros[name.toUpperCase()]) {
      return true;
    }
    return false;
  }
}

export class ExpandMacros {
  private readonly macros: Macros;

  public constructor(globalMacros: readonly string[]) {
    this.macros = new Macros(globalMacros);
  }

  public findMacros(statements: StatementNode[]) {
    let define = false;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      if (statement.get() instanceof Statements.Define) {
        define = true;
        // todo, will this break if first token is a pragma?
        this.macros.addMacro(statement.getTokens()[1].getStr(), []);
      } else if (define === true) {
        if (statement.get() instanceof Statements.EndOfDefinition) {
          define = false;
        } else if (!(statement.get() instanceof Comment)) {
          statements[i] = new StatementNode(new MacroContent()).setChildren(this.tokensToNodes(statement.getTokens()));
        }
      }
    }
  }

  public handleMacros(statements: StatementNode[]) {

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      if (statement.get() instanceof Unknown) {
        let macroName: string | undefined = undefined;
        let previous: Token | undefined = undefined;
        for (const i of statement.getTokens()) {
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
        if (macroName && this.macros.isMacro(macroName)) {
          statements[i] = new StatementNode(new MacroCall()).setChildren(this.tokensToNodes(statement.getTokens()));
        }
      }
    }
  }

//////////////

  private tokensToNodes(tokens: readonly Token[]): TokenNode[] {
    const ret: TokenNode[] = [];

    for (const t of tokens) {
      ret.push(new TokenNode(t));
    }

    return ret;
  }

}