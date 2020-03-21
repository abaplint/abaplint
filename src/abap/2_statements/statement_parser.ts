import * as Tokens from "../1_lexer/tokens";
import * as Statements from "./statements";
import * as Expressions from "./expressions";
import {Combi} from "./combi";
import {TokenNode, StatementNode} from "../nodes";
import {Unknown, Empty, Comment, MacroContent, NativeSQL, IStatement, MacroCall} from "./statements/_statement";
import {Version} from "../../version";
import {Artifacts} from "../artifacts";
import {Token} from "../1_lexer/tokens/_token";
import {Identifier, Pragma} from "../1_lexer/tokens";
import {IFile} from "../../files/_ifile";
import {ABAPFile} from "../../files";
import {Lexer} from "../1_lexer/lexer";

export const STATEMENT_MAX_TOKENS = 1000;

class StatementMap {
  private readonly map: {[index: string]: IStatement[] };

  public constructor() {
    this.map = {};

    for (const stat of Artifacts.getStatements()) {
      const first = stat.getMatcher().first();

      if (this.map[first]) {
        this.map[first].push(stat);
      } else {
        this.map[first] = [stat];
      }
    }
  }

  public lookup(token: Token): IStatement[] {
    let res = this.map[token.getStr().toUpperCase()];
    res = res ? res.concat(this.map[""]) : this.map[""];
    return res;
  }
}

class Macros {
  private readonly macros: string[];

  public constructor(globalMacros: string[]) {
    this.macros = [];
    for (const m of globalMacros) {
      this.macros.push(m.toUpperCase());
    }
  }

  public addMacro(name: string): void {
    if (this.isMacro(name)) {
      return;
    }
    this.macros.push(name.toUpperCase());
  }

  public isMacro(name: string): boolean {
    for (const mac of this.macros) {
      if (mac === name.toUpperCase()) {
        return true;
      }
    }
    return false;
  }
}

class WorkArea {
  private readonly file: IFile;
  public readonly tokens: Token[];
  public statements: StatementNode[];

  public constructor(file: IFile, tokens: Token[]) {
    this.file = file;
    this.tokens = tokens;
    this.statements = [];
  }

  public addUnknown(t: Token[], colon: Token | undefined) {
    this.statements.push(new StatementNode(new Unknown(), colon).setChildren(this.tokensToNodes(t)));
  }

  public toFile(): ABAPFile {
    return new ABAPFile(this.file, this.tokens, this.statements);
  }

  private tokensToNodes(tokens: Token[]): TokenNode[] {
    const ret: TokenNode[] = [];

    for (const t of tokens) {
      ret.push(new TokenNode(t));
    }

    return ret;
  }
}

export class StatementParser {
  private static map: StatementMap;

  private macros: Macros;
  private version: Version;

  public constructor() {
    if (!StatementParser.map) {
      StatementParser.map = new StatementMap();
    }
  }

  public run(files: IFile[], version: Version, globalMacros: string[]): ABAPFile[] {
    this.macros = new Macros(globalMacros);
    this.version = version;

    const wa = files.map(f => new WorkArea(f, Lexer.run(f)));

    for (const w of wa) {
      this.process(w);
      this.categorize(w);
      this.findMacros(w);
    }

    for (const w of wa) {
      this.handleMacros(w);
      this.lazyUnknown(w);
      this.nativeSQL(w);
    }

    return wa.map(w => w.toFile());
  }

  // todo, refactor, remove method here and only have in WorkArea class
  private tokensToNodes(tokens: Token[]): TokenNode[] {
    const ret: TokenNode[] = [];

    for (const t of tokens) {
      ret.push(new TokenNode(t));
    }

    return ret;
  }

// tries to split Unknown statements by newlines, when adding/writing a new statement
// in an editor, adding the statement terminator is typically the last thing to do
// note: this will not work if the second statement is a macro call, guess this is okay
  private lazyUnknown(wa: WorkArea) {
    const result: StatementNode[] = [];

    for (let statement of wa.statements) {
      if (statement.get() instanceof Unknown) {
        for (const {first, second} of this.buildSplits(statement.getTokens())) {
          const s = this.categorizeStatement(new StatementNode(new Unknown()).setChildren(this.tokensToNodes(second)));
          if (!(s.get() instanceof Unknown)) {
            result.push(new StatementNode(new Unknown()).setChildren(this.tokensToNodes(first)));
            statement = s;
            break;
          }
        }
      }
      result.push(statement);
    }

    wa.statements = result;
  }

  private buildSplits(tokens: Token[]): {first: Token[], second: Token[]}[] {
    const res: {first: Token[], second: Token[]}[] = [];
    const before: Token[] = [];
    let prevRow = tokens[0].getRow();

    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].getRow() !== prevRow) {
        res.push({first: [...before], second: [...tokens].splice(i)});
      }
      prevRow = tokens[i].getRow();
      before.push(tokens[i]);
    }

    return res;
  }

  private findMacros(wa: WorkArea) {
    const result: StatementNode[] = [];
    let define = false;

    for (let statement of wa.statements) {
      if (statement.get() instanceof Statements.Define) {
        define = true;
        // todo, will this break if first token is a pragma?
        this.macros.addMacro(statement.getTokens()[1].getStr());
      } else if (statement.get() instanceof Statements.EndOfDefinition) {
        define = false;
      } else if (!(statement.get() instanceof Comment) && define === true) {
        statement = new StatementNode(new MacroContent()).setChildren(this.tokensToNodes(statement.getTokens()));
      }

      result.push(statement);
    }

    wa.statements = result;
  }

  private handleMacros(wa: WorkArea) {
    const result: StatementNode[] = [];

    for (let statement of wa.statements) {
      if (statement.get() instanceof Unknown) {
        let macroName: string | undefined = undefined;
        for (const i of statement.getTokens()) {
          if (i instanceof Identifier) {
            macroName = i.getStr();
            break;
          } else if (i instanceof Pragma) {
            continue;
          } else {
            break;
          }
        }
        if (macroName && this.macros.isMacro(macroName)) {
          statement = new StatementNode(new MacroCall()).setChildren(this.tokensToNodes(statement.getTokens()));
        }
      }

      result.push(statement);
    }

    wa.statements = result;
  }

  private nativeSQL(wa: WorkArea) {
    const result: StatementNode[] = [];
    let sql = false;

    for (let statement of wa.statements) {
      if (statement.get() instanceof Statements.ExecSQL
          || (statement.get() instanceof Statements.Method && statement.findFirstExpression(Expressions.Language))) {
        sql = true;
      } else if (sql === true
          && (statement.get() instanceof Statements.EndExec
          || statement.get() instanceof Statements.EndMethod)) {
        sql = false;
      } else if (!(statement.get() instanceof Comment) && sql === true) {
        statement = new StatementNode(new NativeSQL()).setChildren(this.tokensToNodes(statement.getTokens()));
      }

      result.push(statement);
    }

    wa.statements = result;
  }

  private removeLast(tokens: Token[]): Token[] {
    const copy = tokens.slice();
    copy.pop();
    return copy;
  }

// for each statement, run statement matchers to figure out which kind of statement it is
  private categorize(wa: WorkArea) {
    const result: StatementNode[] = [];

    for (const statement of wa.statements) {
      result.push(this.categorizeStatement(statement));
    }
    wa.statements = result;
  }

  private categorizeStatement(input: StatementNode) {
    let statement = input;

    const length = statement.getTokens().length;
    const last = statement.getTokens()[length - 1];

    if (length === 1
        && last instanceof Tokens.Punctuation) {
      statement = new StatementNode(new Empty()).setChildren(this.tokensToNodes(statement.getTokens()));
// if the statement contains more than STATEMENT_MAX_TOKENS tokens, just give up
    } else if (length > STATEMENT_MAX_TOKENS && statement.get() instanceof Unknown) {
      statement = input;
    } else if (statement.get() instanceof Unknown
        && last instanceof Tokens.Punctuation) {
      statement = this.match(statement);
    }

    return statement;
  }

  private removePragma(tokens: Token[]): {tokens: Token[], pragmas: Token[]} {
    const result: Token[] = [];
    const pragmas: Token[] = [];

    for (const t of tokens) {
      if (t instanceof Tokens.Pragma) {
        pragmas.push(t);
      } else {
        result.push(t);
      }
    }

    return {tokens: result, pragmas: pragmas};
  }

  private match(statement: StatementNode): StatementNode {
    const tokens = statement.getTokens();
    const last = tokens[tokens.length - 1];
    const {tokens: filtered, pragmas} = this.removePragma(this.removeLast(tokens));
    if (filtered.length === 0) {
      return new StatementNode(new Empty()).setChildren(this.tokensToNodes(tokens));
    }

    for (const st of StatementParser.map.lookup(filtered[0])) {
      const match = Combi.run(st.getMatcher(), filtered, this.version);
      if (match) {
        return new StatementNode(st, statement.getColon(), pragmas).setChildren(match.concat(new TokenNode(last)));
      }
    }
    return statement;
  }

// takes care of splitting tokens into statements, also handles chained statements
// statements are split by "," or "."
  private process(wa: WorkArea) {
    let add: Token[] = [];
    let pre: Token[] = [];
    let colon: Token | undefined;

    for (const token of wa.tokens) {
      if (token instanceof Tokens.Comment) {
        wa.statements.push(new StatementNode(new Comment()).setChildren(this.tokensToNodes([token])));
        continue;
      }

      add.push(token);
      if (token.getStr() === ".") {
        wa.addUnknown(pre.concat(add), colon);
        add = [];
        pre = [];
        colon = undefined;
      } else if (token.getStr() === "," && pre.length > 0) {
        wa.addUnknown(pre.concat(add), colon);
        add = [];
      } else if (token.getStr() === ":") {
        colon = token;
        add.pop(); // do not add colon token to statement
        pre = add.slice(0);
        add = [];
      }
    }

    if (add.length > 0) {
      wa.addUnknown(pre.concat(add), colon);
    }
  }
}