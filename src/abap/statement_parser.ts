import * as Tokens from "./tokens";
import * as Statements from "./statements";
import {Combi} from "./combi";
import {TokenNode, StatementNode} from "./node";
import {Unknown, Empty, Comment, MacroContent, NativeSQL} from "./statements/_statement";
import {Version} from "../version";
import {Artifacts} from "./artifacts";
import {Token} from "./tokens/_token";

function className(cla: any) {
  return (cla.constructor + "").match(/\w+/g)[1];
}

class Map {
  private map: {[index: string]: Array<string> };

  public constructor() {
    this.map = {};

    for (let stat of Artifacts.getStatements()) {
      const first = stat.getMatcher().first();

      if (this.map[first]) {
        this.map[first].push(className(stat));
      } else {
        this.map[first] = [className(stat)];
      }
    }
  }

  public lookup(token: Token): Array<string> {
    let res = this.map[token.getStr().toUpperCase()];
    res = res ? res.concat(this.map[""]) : this.map[""];
    return res;
  }
}

export default class StatementParser {
  private static statements: StatementNode[];
  private static map: Map;

  public static run(tokens: Array<Token>, ver = Version.v750): StatementNode[] {
    this.statements = [];

    if (!this.map) {
      this.map = new Map();
    }

    this.process(tokens);
    this.categorize(ver);
    this.macros();
    this.nativeSQL();

    return this.statements;
  }

  private static tokensToNodes(tokens: Array<Token>): Array<TokenNode> {
    let ret: Array<TokenNode> = [];

    tokens.forEach((t) => {ret.push(new TokenNode(t)); });

    return ret;
  }

  private static macros() {
    let result: StatementNode[] = [];
    let define = false;

    for (let statement of this.statements) {
      if (statement.get() instanceof Statements.Define) {
        define = true;
      } else if (statement.get() instanceof Statements.EndOfDefinition) {
        define = false;
      } else if (!(statement.get() instanceof Comment) && define === true) {
        statement = new StatementNode(new MacroContent()).setChildren(this.tokensToNodes(statement.getTokens()));
      }

      result.push(statement);
    }

    this.statements = result;
  }

  private static nativeSQL() {
    let result: StatementNode[] = [];
    let sql = false;

    for (let statement of this.statements) {
      if (statement.get() instanceof Statements.ExecSQL) {
        sql = true;
      } else if (statement.get() instanceof Statements.EndExec) {
        sql = false;
      } else if (!(statement.get() instanceof Comment) && sql === true) {
        statement = new StatementNode(new NativeSQL()).setChildren(this.tokensToNodes(statement.getTokens()));
      }

      result.push(statement);
    }

    this.statements = result;
  }

  private static removeLast(tokens: Array<Token>): Array<Token> {
    let copy = tokens.slice();
    copy.pop();
    return copy;
  }

// for each statement, run statement matchers to figure out which kind of statement it is
  private static categorize(ver: Version) {
    let result: StatementNode[] = [];

    for (let statement of this.statements) {
      let length = statement.getTokens().length;
      let last = statement.getTokens()[length - 1];

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

  private static removePragma(tokens: Array<Token>): Array<Token> {
    return tokens.filter(function (value) { return !(value instanceof Tokens.Pragma); } );
  }

  private static match(statement: StatementNode, ver: Version): StatementNode {
    let tokens = statement.getTokens();
    let last = tokens[tokens.length - 1];
    tokens = this.removePragma(this.removeLast(tokens));
    if (tokens.length === 0) {
      return new StatementNode(new Empty()).setChildren(this.tokensToNodes(this.removePragma(statement.getTokens())));
    }

    for (let st of this.map.lookup(tokens[0])) {
      let match = Combi.run(Artifacts.newStatement(st).getMatcher(),
                            tokens,
                            ver);
      if (match) {
        return new StatementNode(Artifacts.newStatement(st)).setChildren(match.concat(new TokenNode(last)));
      }
    }
    return statement;
  }

// takes care of splitting tokens into statements, also handles chained statements
  private static process(tokens: Array<Token>) {
    let add: Array<Token> = [];
    let pre: Array<Token> = [];
    let ukn = (t: Token[]) => { this.statements.push(new StatementNode(new Unknown()).setChildren(this.tokensToNodes(t))); };

    for (let token of tokens) {
      if (token instanceof Tokens.Comment) {
        this.statements.push(new StatementNode(new Comment()).setChildren(this.tokensToNodes([token])));
        continue;
      }

      add.push(token);
      if (token.getStr() === ".") {
        ukn(pre.concat(add));
        add = [];
        pre = [];
      } else if (token.getStr() === "," && pre.length > 0) {
        ukn(pre.concat(add));
        add = [];
      } else if (token.getStr() === ":") {
        add.pop(); // do not add colon token to statement
        pre = add.slice(0);
        add = [];
      }
    }

    if (add.length > 0) {
      ukn(pre.concat(add));
    }
  }
}