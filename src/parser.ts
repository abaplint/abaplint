import * as Tokens from "./tokens/";
import File from "./file";
import * as Statements from "./statements/";

/*
class Timer {
  private times;
  private count;
  private startTime: number;

  public constructor() {
    this.times = {};
    this.count = {};
  }

  public start(): void {
    this.startTime = new Date().getTime();
  }

  public stop(name: string): void {
    let end = new Date().getTime();
    let time = end - this.startTime;
    if (this.times[name]) {
      this.times[name] = this.times[name] + time;
      this.count[name] = this.count[name] + 1;
    } else {
      this.times[name] = time;
      this.count[name] = 1;
    }
  }

  public output(filename: string) {
    for (let name in this.times) {
      if (this.times[name] > 100) {
        console.log(name + "\t" + this.times[name] + "ms\t" + this.count[name] + "\t" + filename);
      }
    }
  }
}
*/

export default class Parser {
  private static statements: Array<Statements.Statement>;
//  private static timer;

  public static run(file: File): Array<Statements.Statement> {
    this.statements = [];

//    this.timer = new Timer();

    this.process(file.getTokens());
    this.categorize();
    this.macros();

//    this.timer.output(file.getFilename());

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
        statement = new Statements.Macro(statement.getTokens());
      }

      result.push(statement);
    }

    this.statements = result;
  }

// for each statement, run statement matchers to figure out which kind of statement it is
  private static categorize() {
    let result: Array<Statements.Statement> = [];

    for (let statement of this.statements) {
      let last = statement.getTokens()[statement.getTokens().length - 1];
      if (statement instanceof Statements.Unknown && last instanceof Tokens.Punctuation) {
        for (let st in Statements) {
//          this.timer.start();
          let known = Statements[st].match(statement.getTokens());
//          this.timer.stop(st);
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

// takes care of splitting tokens into statements, also handles chained statements
  private static process(tokens: Array<Tokens.Token>) {
    let add: Array<Tokens.Token> = [];
    let pre: Array<Tokens.Token> = [];

    for (let token of tokens) {
      if (token instanceof Tokens.Comment) {
        this.statements.push(new Statements.Comment([token]));
        continue;
      }

      add.push(token);
      if (token.getStr() === ".") {
        let statement = new Statements.Unknown(pre.concat(add));
        this.statements.push(statement);
        add = [];
        pre = [];
      } else if (token.getStr() === "," && pre.length > 0) {
        let statement = new Statements.Unknown(pre.concat(add));
        this.statements.push(statement);
        add = [];
      } else if (token.getStr() === ":") {
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