import * as Tokens from "./tokens/";
import File from "./file";
import * as Statements from "./statements/";
import Registry from "./registry";
import {Combi} from "./combi";
import Node from "./node";
import {Statement, Unknown, Empty, Comment, MacroCall, MacroContent} from "./statements/statement";

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

export default class Parser {
  private static statements: Array<Statement>;
  private static timer;

  public static run(file: File, timer = false): Array<Statement> {
    this.statements = [];
    if (timer) {
      console.log(file.getFilename());
      this.timer = new Timer();
    }

    this.process(file.getTokens());
    this.categorize();
    this.macros();

    if (timer) {
      this.timer.output(file.getFilename());
    }

    return this.statements;
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
        statement = new MacroContent(statement.getTokens());
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
  private static categorize() {
    let result: Array<Statement> = [];

    for (let statement of this.statements) {
      let length = statement.getTokens().length;
      let last = statement.getTokens()[length - 1];
// console.dir(statement.getTokens());
      if (length === 1 && last instanceof Tokens.Punctuation) {
        statement = new Empty(statement.getTokens(), new Node("Empty"));
      } else if (statement instanceof Unknown
          && last instanceof Tokens.Punctuation) {
        let res = this.match(statement);
        if (res !== undefined) {
          statement = res;
        }
      }
      if (statement instanceof Unknown) {
        if (Registry.isMacro(statement.getTokens()[0].getStr())) {
          statement = new MacroCall(statement.getTokens(), new Node("MacroCall"));
        }
      }

      result.push(statement);
    }
    this.statements = result;
  }

  private static match(statement: Statement): Statement {
    for (let st in Statements) {
/*
      if (st !== "Export") {
        continue;
      }
*/
      if (this.timer) {
        this.timer.start();
      }
      let root = new Node(st);
      let match = Combi.run(Statements[st].get_matcher(),
                            this.removeLast(statement.getTokens()),
                            root);
      if (this.timer) {
        this.timer.stop(st);
      }
      if (match === true) {
        return new Statements[st](statement.getTokens(), root);
      }
    }
    return undefined;
  }

// takes care of splitting tokens into statements, also handles chained statements
  private static process(tokens: Array<Tokens.Token>) {
    let add: Array<Tokens.Token> = [];
    let pre: Array<Tokens.Token> = [];

    for (let token of tokens) {
      if (token instanceof Tokens.Comment) {
        this.statements.push(new Comment([token], new Node("Comment", token)));
        continue;
      }

      add.push(token);
      if (token.getStr() === ".") {
        let statement = new Unknown(pre.concat(add));
        this.statements.push(statement);
        add = [];
        pre = [];
      } else if (token.getStr() === "," && pre.length > 0) {
        let statement = new Unknown(pre.concat(add));
        this.statements.push(statement);
        add = [];
      } else if (token.getStr() === ":") {
        add.pop(); // do not add colon token to statement
        pre = add.slice(0);
        add = [];
      }
    }

    if (add.length > 0) {
      let statement = new Unknown(pre.concat(add));
      this.statements.push(statement);
    }
  }
}