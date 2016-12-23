import * as Tokens from "./tokens/";
import * as Statements from "./statements/";
import {Combi} from "./combi";
import {Statement, Unknown, Empty, Comment, MacroContent} from "./statements/statement";
import {Version} from "./version";

export default class Parser {
  private static statements: Array<Statement>;
  private static map;

  public static run(tokens: Array<Tokens.Token>, ver = Version.v750): Array<Statement> {
    this.statements = [];

    if (!this.map) {
      this.initialize();
    }

    this.process(tokens);
    this.categorize(ver);
    this.macros();

    return this.statements;
  }

  private static initialize() {
    this.map = {};

    for (let st in Statements) {
      let first = Statements[st].get_matcher().first();

      if (this.map[first]) {
        this.map[first].push(st);
      } else {
        this.map[first] = [st];
      }
    }
  }

  private static macros() {
    let result: Array<Statement> = [];
    let define = false;

    for (let statement of this.statements) {
      if (statement instanceof Statements.Define) {
        define = true;
      } else if (statement instanceof Statements.Enddefine) {
        define = false;
      } else if (statement instanceof Unknown && define === true) {
        statement = new MacroContent(statement.getTokens(), []);
      }

      result.push(statement);
    }

    this.statements = result;
  }

  private static removeLast(tokens: Array<Tokens.Token>): Array<Tokens.Token> {
    let copy = tokens.slice();
    copy.pop();
    return copy;
  }

// for each statement, run statement matchers to figure out which kind of statement it is
  private static categorize(ver: Version) {
    let result: Array<Statement> = [];

    for (let statement of this.statements) {
      let length = statement.getTokens().length;
      let last = statement.getTokens()[length - 1];
// console.dir(statement.getTokens());
      if (length === 1 && last instanceof Tokens.Punctuation) {
        statement = new Empty(statement.getTokens(), []);
      } else if (statement instanceof Unknown
          && last instanceof Tokens.Punctuation) {
        statement = this.match(statement, ver);
      }

      result.push(statement);
    }
    this.statements = result;
  }

  private static match(statement: Statement, ver: Version): Statement {
    let test = this.map[statement.getTokens()[0].getStr().toUpperCase()];
    test = test ? test.concat(this.map[""]) : this.map[""];

    for (let st of test) {
      let match = Combi.run(Statements[st].get_matcher(),
                            this.removeLast(statement.getTokens()),
                            ver);
      if (match) {
//        let root = new StatementNode(st).setChildren(match);
        return new Statements[st](statement.getTokens(), match);
      }
    }
    return statement;
  }

// takes care of splitting tokens into statements, also handles chained statements
  private static process(tokens: Array<Tokens.Token>) {
    let add: Array<Tokens.Token> = [];
    let pre: Array<Tokens.Token> = [];
    let ukn = (t) => { this.statements.push(new Unknown(t, [])); };

    for (let token of tokens) {
      if (token instanceof Tokens.Comment) {
        this.statements.push(new Comment([token], []));
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