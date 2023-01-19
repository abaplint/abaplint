import * as Statements from "./statements";
import * as Expressions from "./expressions";
import * as Tokens from "../1_lexer/tokens";
import {MacroContent, Comment, Unknown, MacroCall} from "./statements/_statement";
import {StatementNode} from "../nodes/statement_node";
import {Token} from "../1_lexer/tokens/_token";
import {TokenNode} from "../nodes/token_node";
import {Version} from "../../version";
import {StatementParser} from "./statement_parser";
import {MemoryFile} from "../../files/memory_file";
import {Lexer} from "../1_lexer/lexer";
import {VirtualPosition} from "../../position";
import {IRegistry} from "../../_iregistry";
import {Program} from "../../objects/program";

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

  public listMacroNames(): string[] {
    return Object.keys(this.macros);
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
  private readonly globalMacros: readonly string[];
  private readonly version: Version;
  private readonly reg?: IRegistry;

  // "reg" must be supplied if there are cross object macros via INCLUDE
  public constructor(globalMacros: readonly string[], version: Version, reg?: IRegistry) {
    this.macros = new Macros(globalMacros);
    this.version = version;
    this.globalMacros = globalMacros;
    this.reg = reg;
  }

  public find(statements: StatementNode[]) {
    let name: string | undefined = undefined;
    let contents: StatementNode[] = [];

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const type = statement.get();

      if (type instanceof Statements.Define) {
        // todo, will this break if first token is a pragma?
        name = statement.getTokens()[1].getStr();
        contents = [];
      } else if (type instanceof Statements.Include) {
        const includeName = statement.findDirectExpression(Expressions.IncludeName)?.concatTokens();
        // todo, this does not take function module includes into account
        const prog = this.reg?.getObject("PROG", includeName) as Program | undefined;
        if (prog) {
          prog.parse(this.version, this.globalMacros, this.reg);
          const main = prog.getMainABAPFile();
          if (main) {
            // slow, this copies everything,
            this.find([...main.getStatements()]);
          }
        }
      } else if (name) {
        if (type instanceof Statements.EndOfDefinition) {
          this.macros.addMacro(name, contents);
          name = undefined;
        } else if (!(type instanceof Comment)) {
          statements[i] = new StatementNode(new MacroContent()).setChildren(this.tokensToNodes(statement.getTokens()));
          contents.push(statements[i]);
        }
      }
    }
  }

  public handleMacros(statements: readonly StatementNode[]): {statements: StatementNode[], containsUnknown: boolean} {
    const result: StatementNode[] = [];
    let containsUnknown = false;

    for (const statement of statements) {
      const type = statement.get();
      if (type instanceof Unknown || type instanceof MacroCall) {
        const macroName = this.findName(statement.getTokens());
        if (macroName && this.macros.isMacro(macroName)) {
          result.push(new StatementNode(new MacroCall(), statement.getColon()).setChildren(this.tokensToNodes(statement.getTokens())));

          const expanded = this.expandContents(macroName, statement);
          const handled = this.handleMacros(expanded);
          for (const e of handled.statements) {
            result.push(e);
          }
          if (handled.containsUnknown === true) {
            containsUnknown = true;
          }

          continue;
        } else {
          containsUnknown = true;
        }
      }
      result.push(statement);
    }

    return {statements: result, containsUnknown};
  }

  //////////////

  private expandContents(name: string, statement: StatementNode): readonly StatementNode[] {
    const contents = this.macros.getContents(name);
    if (contents === undefined || contents.length === 0) {
      return [];
    }

    let str = "";
    for (const c of contents) {
      let concat = c.concatTokens();
      if (c.getTerminator() === ",") {
        // workaround for chained statements
        concat = concat.replace(/,$/, ".");
      }
      str += concat + "\n";
    }

    const inputs = this.buildInput(statement);
    let i = 1;
    for (const input of inputs) {
      const search = "&" + i;
      const reg = new RegExp(search, "g");
      str = str.replace(reg, input);
      i++;
    }

    const file = new MemoryFile("expand_macros.abap.prog", str);
    const lexerResult = new Lexer().run(file, statement.getFirstToken().getStart());

    const result = new StatementParser(this.version, this.reg).run([lexerResult], this.macros.listMacroNames());
    return result[0].statements;
  }

  private buildInput(statement: StatementNode): string[] {
    const result: string[] = [];
    const tokens = statement.getTokens();

    let build = "";
    for (let i = 1; i < tokens.length - 1; i++) {
      const now = tokens[i];
      let next: Token | undefined = tokens[i + 1];
      if (i + 2 === tokens.length) {
        next = undefined; // dont take the punctuation
      }

      // argh, macros is a nightmare
      let end = now.getStart();
      if (end instanceof VirtualPosition) {
        end = new VirtualPosition(end, end.vrow, end.vcol + now.getStr().length);
      } else {
        end = now.getEnd();
      }

      if (next && next.getStart().equals(end)) {
        build += now.getStr();
      } else {
        build += now.getStr();
        result.push(build);
        build = "";
      }
    }

    return result;
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