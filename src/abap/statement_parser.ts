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
    // todo, handle scoping for macros
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

  public static run(tokens: Token[], config: Config): StatementNode[] {
    this.statements = [];
    this.macros = new Macros(config);

    if (!this.map) {
      this.map = new Map();
    }

    this.process(tokens);
    this.categorize(config.getVersion());
    this.nativeSQL();
    this.handleMacros();

    return this.statements;
  }

  private static tokensToNodes(tokens: Token[]): TokenNode[] {
    const ret: TokenNode[] = [];

    tokens.forEach((t) => {ret.push(new TokenNode(t)); });

    return ret;
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
  private static categorize(ver: Version) {
    const result: StatementNode[] = [];

    for (let statement of this.statements) {
      const length = statement.getTokens().length;
      const last = statement.getTokens()[length - 1];

      if (length === 1
          && last instanceof Tokens.Punctuation) {
        statement = new StatementNode(new Empty()).setChildren(this.tokensToNodes(statement.getTokens()));
      } else if (statement.get() instanceof Unknown
          && last instanceof Tokens.Punctuation) {
        statement = this.match(statement, ver);
      }

      result.push(statement);
    }
    this.statements = result;
  }

  private static removePragma(tokens: Token[]): Token[] {
    return tokens.filter(function (value) { return !(value instanceof Tokens.Pragma); } );
  }

  private static match(statement: StatementNode, ver: Version): StatementNode {
    let tokens = statement.getTokens();
    const last = tokens[tokens.length - 1];
    tokens = this.removePragma(this.removeLast(tokens));
    if (tokens.length === 0) {
      return new StatementNode(new Empty()).setChildren(this.tokensToNodes(this.removePragma(statement.getTokens())));
    }

    for (const st of this.map.lookup(tokens[0])) {
      const match = Combi.run(st.getMatcher(),
                              tokens,
                              ver);
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