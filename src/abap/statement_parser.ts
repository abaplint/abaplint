import * as Tokens from "./tokens";
import * as Statements from "./statements";
import * as Expressions from "./expressions";
import {Combi} from "./combi";
import {TokenNode, StatementNode} from "./nodes/";
import {Unknown, Empty, Comment, MacroContent, NativeSQL, Statement, MacroCall} from "./statements/_statement";
import {Version} from "../version";
import {Artifacts} from "./artifacts";
import {Token} from "./tokens/_token";
import {Config} from "../config";
import {Identifier, Pragma} from "./tokens";

class Map {
  private map: {[index: string]: Statement[] };

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

  public lookup(token: Token): Statement[] {
    let res = this.map[token.getStr().toUpperCase()];
    res = res ? res.concat(this.map[""]) : this.map[""];
    return res;
  }
}

class Macros {
  private macros: string[];

  constructor(config: Config) {
    this.macros = [];
    for (const m of config.getSyntaxSetttings().globalMacros) {
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

export class StatementParser {
  private static statements: StatementNode[];
  private static map: Map;
  private static macros: Macros;
  private static version: Version;

  public static run(tokens: Token[], config: Config): StatementNode[] {
    this.statements = [];
    this.macros = new Macros(config);
    this.version = config.getVersion();

    if (!this.map) {
      this.map = new Map();
    }

    this.process(tokens);
    this.categorize();
    this.nativeSQL();
    this.handleMacros();
    this.lazyUnknown();

    return this.statements;
  }

  private static tokensToNodes(tokens: Token[]): TokenNode[] {
    const ret: TokenNode[] = [];

    tokens.forEach((t) => {ret.push(new TokenNode(t)); });

    return ret;
  }

// tries to split Unknown statements by newlines, when adding/writing a new statement
// in an editor, adding the statement terminator is typically the last thing to do
// note: this will not work if the second statement is a macro call, guess this is okay
  private static lazyUnknown() {
    const result: StatementNode[] = [];

    for (let statement of this.statements) {
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

    this.statements = result;
  }

  private static buildSplits(tokens: Token[]): {first: Token[], second: Token[]}[] {
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

  private static handleMacros() {
    const result: StatementNode[] = [];
    let define = false;

    for (let statement of this.statements) {
      if (statement.get() instanceof Statements.Define) {
        define = true;
        // todo, will this break if first token is a pragma?
        this.macros.addMacro(statement.getTokens()[1].getStr());
      } else if (statement.get() instanceof Statements.EndOfDefinition) {
        define = false;
      } else if (!(statement.get() instanceof Comment) && define === true) {
        statement = new StatementNode(new MacroContent()).setChildren(this.tokensToNodes(statement.getTokens()));
      } else if (statement.get() instanceof Unknown) {
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

    this.statements = result;
  }

  private static nativeSQL() {
    const result: StatementNode[] = [];
    let sql = false;

    for (let statement of this.statements) {
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

    this.statements = result;
  }

  private static removeLast(tokens: Token[]): Token[] {
    const copy = tokens.slice();
    copy.pop();
    return copy;
  }

// for each statement, run statement matchers to figure out which kind of statement it is
  private static categorize() {
    const result: StatementNode[] = [];

    for (const statement of this.statements) {
      result.push(this.categorizeStatement(statement));
    }
    this.statements = result;
  }

  private static categorizeStatement(input: StatementNode) {
    let statement = input;

    const length = statement.getTokens().length;
    const last = statement.getTokens()[length - 1];

    if (length === 1
        && last instanceof Tokens.Punctuation) {
      statement = new StatementNode(new Empty()).setChildren(this.tokensToNodes(statement.getTokens()));
    } else if (statement.get() instanceof Unknown
        && last instanceof Tokens.Punctuation) {
      statement = this.match(statement);
    }

    return statement;
  }

  private static removePragma(tokens: Token[]): Token[] {
    return tokens.filter(function (value) { return !(value instanceof Tokens.Pragma); } );
  }

  private static match(statement: StatementNode): StatementNode {
    let tokens = statement.getTokens();
    const last = tokens[tokens.length - 1];
    tokens = this.removePragma(this.removeLast(tokens));
    if (tokens.length === 0) {
      return new StatementNode(new Empty()).setChildren(this.tokensToNodes(this.removePragma(statement.getTokens())));
    }

    for (const st of this.map.lookup(tokens[0])) {
      const match = Combi.run(st.getMatcher(), tokens, this.version);
      if (match) {
        return new StatementNode(st).setChildren(match.concat(new TokenNode(last)));
      }
    }
    return statement;
  }

  private static addUnknown(t: Token[]) {
    this.statements.push(new StatementNode(new Unknown()).setChildren(this.tokensToNodes(t)));
  }

// takes care of splitting tokens into statements, also handles chained statements
// statements are split by "," or "."
  private static process(tokens: Token[]) {
    let add: Token[] = [];
    let pre: Token[] = [];

    for (const token of tokens) {
      if (token instanceof Tokens.Comment) {
        this.statements.push(new StatementNode(new Comment()).setChildren(this.tokensToNodes([token])));
        continue;
      }

      add.push(token);
      if (token.getStr() === ".") {
        this.addUnknown(pre.concat(add));
        add = [];
        pre = [];
      } else if (token.getStr() === "," && pre.length > 0) {
        this.addUnknown(pre.concat(add));
        add = [];
      } else if (token.getStr() === ":") {
        add.pop(); // do not add colon token to statement
        pre = add.slice(0);
        add = [];
      }
    }

    if (add.length > 0) {
      this.addUnknown(pre.concat(add));
    }
  }
}