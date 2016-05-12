import * as Tokens from "./tokens/";
import File from "./file";
import * as Statements from "./statements/";

export default class Parser {
  private static statements: Array<Statements.Statement>;

  public static run(file: File): Array<Statements.Statement> {
    this.statements = [];

    this.process(file.getTokens());
    this.categorize();
    this.macros();

    return this.statements;
  }

  private static macros() {
    let result: Array<Statements.Statement> = [];
    let define = false;

    for (let statement of this.statements) {
      if (statement instanceof Statements.Define) {
        define = true;
      } else if (statement instanceof Statements.Enddefine) {
        define = false;
      } else if (statement instanceof Statements.Unknown && define === true) {
        statement = new Statements.Macro(statement.get_tokens());
      }

      result.push(statement);
    }

    this.statements = result;
  }

  private static categorize() {
    let result: Array<Statements.Statement> = [];

    for (let statement of this.statements) {
      let last = statement.get_tokens()[statement.get_tokens().length - 1];
      if (statement instanceof Statements.Unknown && last instanceof Tokens.Punctuation) {
        for (let st in Statements) {
          let known = Statements[st].match(statement.get_tokens());
          if (known !== undefined) {
            statement = known;
            break;
          }
        }
      }
      result.push(statement);
    }

    this.statements = result;
  }

  private static process(tokens: Array<Tokens.Token>) {
    let add: Array<Tokens.Token> = [];
    let pre: Array<Tokens.Token> = [];

    for (let token of tokens) {
      if (token instanceof Tokens.Comment) {
        this.statements.push(new Statements.Comment([token]));
        continue;
      }

      add.push(token);
      if (token.get_str() === ".") {
        let statement = new Statements.Unknown(pre.concat(add));
        this.statements.push(statement);
        add = [];
        pre = [];
      } else if (token.get_str() === "," && pre.length > 0) {
        let statement = new Statements.Unknown(pre.concat(add));
        this.statements.push(statement);
        add = [];
      } else if (token.get_str() === ":") {
        add.pop(); // do not add colon token to statement
        pre = add.slice(0);
        add = [];
      }
    }

    if (add.length > 0) {
      let statement = new Statements.Unknown(pre.concat(add));
      this.statements.push(statement);
    }
  }
}