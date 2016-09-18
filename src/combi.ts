import "../typings/index.d.ts";
import * as Tokens from "./tokens/";
import Position from "./position";
import {TokenNode, BasicNode, ReuseNode, CountableNode} from "./node";
import {Version, versionDescription} from "../src/version";

export class Result {
  private tokens: Array<Tokens.Token>;
  private nodes: Array<CountableNode>;

  constructor(a: Array<Tokens.Token>, n?: Array<CountableNode>) {
    this.tokens = a;
    this.nodes = n;
    if (this.nodes === undefined) {
      this.nodes = [];
    }
  }

  public peek(): Tokens.Token {
    return this.tokens[0];
  }

// todo, make it non optional
  public shift(node?: CountableNode): Result {
    let copy = this.tokens.slice();
    copy.shift();
    let cp = this.nodes.slice();
    cp.push(node);
    return new Result(copy, cp);
  }

  public getTokens(): Array<Tokens.Token> {
    return this.tokens;
  }

  public popNode(): CountableNode {
    return this.nodes.pop();
  }

  public getNodes(): Array<CountableNode> {
    return this.nodes;
  }

  public setNodes(n: Array<CountableNode>): void {
    this.nodes = n;
  }

  public length(): number {
    return this.tokens.length;
  }

  public toStr(): string {
    let ret = "";
    for (let token of this.tokens) {
      ret = ret + " " + token.getStr();
    }
    return ret;
  }
}

export interface IRunnable {
  run(r: Array<Result>): Array<Result>;
  railroad(): string;
  toStr(): string;
// return first keyword, blank if not applicable
  first(): string;
}

class Regex implements IRunnable {

  private regexp: RegExp;

  constructor(r: RegExp) {
    this.regexp = r;
  }

  public run(r: Array<Result>): Array<Result> {
    let result: Array<Result> = [];

    for (let input of r) {
      if (input.length() !== 0
          && this.regexp.test(input.peek().getStr()) === true) {
        result.push(input.shift(new TokenNode("Regex", input.peek())));
      }
    }

    return result;
  }

  public railroad() {
    return "Railroad.Terminal(\"" + this.regexp.source.replace(/\\/g, "\\\\") + "\")";
  }

  public toStr() {
    return this.regexp.toString();
  }

  public first() {
    return "";
  }
}

class Word implements IRunnable {

  private s: string;

  constructor(s: string) {
    this.s = s;
  }

  public run(r: Array<Result>): Array<Result> {
    let result: Array<Result> = [];

    for (let input of r) {
      if (input.length() !== 0
          && input.peek().getStr().toUpperCase() === this.s.toUpperCase()) {
        result.push(input.shift(new TokenNode("Word", input.peek())));
      }
    }
    return result;
  }

  public railroad() {
    return "Railroad.Terminal('\"" + this.s + "\"')";
  }

  public toStr() {
    return "\"" + this.s + "\"";
  }

  public first() {
    return this.s;
  }
}

function className(cla) {
  return (cla.constructor + "").match(/\w+/g)[1];
}

function functionName(fun) {
  return (fun + "").match(/\w+/g)[1];
}

class Token implements IRunnable {

  private s: String;

  constructor(s: String) {
    this.s = s;
  }

  public run(r: Array<Result>): Array<Result> {
    let result: Array<Result> = [];

    for (let input of r) {
//      console.dir(input.peek().constructor);
      if (input.length() !== 0
          && className(input.peek()).toUpperCase() === this.s.toUpperCase()) {
        result.push(input.shift(new TokenNode("Token", input.peek())));
      }
    }
    return result;
  }

  public railroad() {
    let text = this.s;

    for (let token in Tokens) {
      if (token === this.s && Tokens[token].railroad) {
        text = Tokens[token].railroad();
        break;
      }
    }
    return "Railroad.Terminal('!\"" + text + "\"')";
  }

  public toStr() {
    return "Token \"" + this.s + "\"";
  }

  public first() {
    return "";
  }

/*
  private className(t: Tokens.Token): string {
    let str = t.constructor.toString();
    return str.match(/\w+/g)[1];
  }
  */
}

class Vers implements IRunnable {

  private ver: Version;
  private runnable: IRunnable;

  constructor(ver: Version, runnable: IRunnable) {
    this.ver = ver;
    this.runnable = runnable;
  }

  public run(r: Array<Result>): Array<Result> {
    if (Combi.getVersion() >= this.ver) {
      return this.runnable.run(r);
    } else {
      return [];
    }
  }

  public railroad() {
    return "Railroad.Sequence(Railroad.Comment(\"" +
      versionDescription(this.ver) +
      "\"), " +
      this.runnable.railroad() +
      ")";
  }

  public toStr() {
    return "Version(" + this.runnable.toStr() + ")";
  }

  public first() {
    return "";
  }
}

class Optional implements IRunnable {

  private opt: IRunnable;

  constructor(opt: IRunnable) {
    this.opt = opt;
  }

  public run(r: Array<Result>): Array<Result> {
    let result: Array<Result> = [];

    for (let input of r) {
      result.push(input);
      let res = this.opt.run([input]);
      result = result.concat(res);
    }

    return result;
  }

  public railroad() {
    return "Railroad.Optional(" + this.opt.railroad() + ")";
  }

  public toStr() {
    return "opt(" + this.opt.toStr() + ")";
  }

  public first() {
    return "";
  }
}

class Star implements IRunnable {

  private star: IRunnable;

  constructor(star: IRunnable) {
    this.star = star;
  }

  public run(r: Array<Result>): Array<Result> {
    let result = r;

// console.log("Star input " + r.length + " " + this.star.toStr());
// outputResultArray(r);

    let res = r;
    let input: Array<Result> = [];
    while (true) {
      input = res;
      res = this.star.run(input);

      if (res.length === 0) {
        break;
      }
// console.log("\nStar add " + res.length);
// outputResultArray(res);
      result = result.concat(res);
    }
// console.log("\nStar return " + result.length);

// console.clear();
    return result;
  }

  public railroad() {
    return "Railroad.ZeroOrMore(" + this.star.railroad() + ")";
  }

  public toStr() {
    return "star(" + this.star.toStr() + ")";
  }

  public first() {
    return "";
  }
}

class Plus implements IRunnable {

  private plus: IRunnable;

  constructor(plus: IRunnable) {
    this.plus = plus;
  }

  public run(r: Array<Result>): Array<Result> {
    return new Sequence([this.plus, new Star(this.plus)]).run(r);
  }

  public railroad() {
    return "Railroad.OneOrMore(" + this.plus.railroad() + ")";
  }

  public toStr() {
    return "plus(" + this.plus.toStr() + ")";
  }

  public first() {
    return this.plus.first();
  }
}

class Sequence implements IRunnable {
  private list: Array<IRunnable>;

  constructor(list: IRunnable[]) {
    if (list.length < 2) {
      throw new Error("Sequence, length error");
    }
    this.list = list;
  }

  public run(r: Array<Result>): Array<Result> {
    let result: Array<Result> = [];

    for (let input of r) {
      let temp = [input];
      for (let seq of this.list) {
        temp = seq.run(temp);
        if (temp.length === 0) {
          break;
        }
      }

      result = result.concat(temp);
    }

    return result;
  }

  public railroad() {
    let children = this.list.map((e) => { return e.railroad(); });
    return "Railroad.Sequence(" + children.join() + ")";
  }

  public toStr() {
    let ret = "";
    for (let i of this.list) {
      ret = ret + i.toStr() + ",";
    }
    return "seq(" + ret + ")";
  }

  public first() {
    return this.list[0].first();
  }
}

class WordSequence implements IRunnable {

  private str: String;
  private words: Array<IRunnable> = [];

  constructor(str: String) {
    this.str = str;

    let foo = this.str.replace(/-/g, " - ");
    let split = foo.split(/[ ]/);

    for (let st of split) {
// todo, use Dash token
      this.words.push(new Word(st));
    }
  }

  public run(r: Array<Result>): Array<Result> {
    return (new Sequence(this.words)).run(r);
  }

  public railroad() {
    return "Railroad.Terminal('\"" + this.str + "\"')";
  }

  public toStr() {
    return "str(" + this.str + ")";
  }

  public first() {
    return this.words[0].first();
  }
}

export abstract class Reuse implements IRunnable {
  public run(r: Array<Result>): Array<Result> {
    let results: Array<Result> = [];

    for (let input of r) {
      let temp = this.get_runnable().run([input]);

      let moo: Array<Result> = [];
      for (let t of temp) {
        let consumed = input.length() - t.length();
        if (consumed > 0) {
          let length = t.getNodes().length;
          let re = new ReuseNode(this);
          let children = [];
          while (consumed > 0) {
            let sub = t.popNode();
            children.push(sub);
            consumed = consumed - sub.countTokens();
          }
          re.setChildren(children.reverse());

          t.setNodes(t.getNodes().slice(0, length - consumed).concat([re]));
        }
        moo.push(t);
      }

      results = results.concat(moo);
    }

    return results;
  }

  public abstract get_runnable(): IRunnable;

  public getName(): string {
    return className(this);
  }

  public railroad() {
    return "Railroad.NonTerminal('" + this.getName() + "', 'reuse_" + this.getName().toLowerCase() + ".svg')";
  }

  public toStr() {
    return "reuse(" + this.getName() + ")";
  }

  public first() {
    return "";
  }
}

class Permutation implements IRunnable {
  private list: Array<IRunnable>;

  constructor(list: IRunnable[]) {
    if (list.length < 2) {
      throw new Error("Permutation, length error");
    }
    this.list = list;
  }

  public run(r: Array<Result>): Array<Result> {
    let result: Array<Result> = r;

    for (let index = 0; index < this.list.length; index++) {
      let temp = this.list[index].run(r);
      if (temp.length !== 0) {
// match
        result = result.concat(temp);

        let left = this.list;
        left.splice(index, 1);
        if (left.length === 1) {
          result = result.concat(left[0].run(temp));
        } else {
          result = result.concat(new Permutation(left).run(temp));
        }
      }
    }

    return result;
  }

  public railroad() {
    let children = this.list.map((e) => { return e.railroad(); });
    return "Railroad.MultipleChoice(0, 'any'," + children.join() + ")";
  }

  public toStr() {
    let children = this.list.map((e) => { return e.toStr(); });
    return "per(" + children.join() + ")";
  }

  public first() {
    return "";
  }
}

class Alternative implements IRunnable {
  private list: Array<IRunnable>;

  constructor(list: IRunnable[]) {
    if (list.length < 2) {
      throw new Error("Alternative, length error");
    }
    this.list = list;
  }

  public run(r: Array<Result>): Array<Result> {
    let result: Array<Result> = [];

    for (let input of r) {
      for (let seq of this.list) {
        let temp = seq.run([input]);
        result = result.concat(temp);
      }
    }

    return result;
  }

  public railroad() {
    let children = this.list.map((e) => { return e.railroad(); });
    return "Railroad.Choice(0, " + children.join() + ")";
  }

  public toStr() {
    let ret = "";
    for (let i of this.list) {
      ret = ret + i.toStr() + ",";
    }
    return "alt(" + ret + ")";
  }

  public first() {
    return "";
  }
}

export class Combi {

  private static ver: Version;

  public static railroad(runnable: IRunnable, complex = false): string {
    let type = "Railroad.Diagram(";
    if (complex === true) {
      type = "Railroad.ComplexDiagram(";
    }

    let result = "Railroad.Diagram.INTERNAL_ALIGNMENT = 'left';\n" +
      type +
      runnable.railroad() +
      ").toString();";
    return result;
  }

  public static run(runnable: IRunnable, tokens: Array<Tokens.Token>, ver = Version.v750): BasicNode[] {
    this.ver = ver;

    tokens = this.removePragma(tokens);

    let input = new Result(tokens);

    let result = runnable.run([input]);

    for (let res of result) {
      if (res.length() === 0) {
        return res.getNodes();
      }
    }

    return undefined;
  }

  public static getVersion(): Version {
    return this.ver;
  }

  private static removePragma(tokens: Array<Tokens.Token>): Array<Tokens.Token> {
    return tokens.filter(function (value) { return !(value instanceof Tokens.Pragma); } );
  }
}

// -----------------------------------------------------------------------------

export function str(s: string): IRunnable {
  if (/[ -]/.test(s) === false) {
    return new Word(s);
  } else {
    return new WordSequence(s);
  }
}
export function seq(first: IRunnable, ...rest: IRunnable[]): IRunnable {
  return new Sequence([first].concat(rest));
}
export function alt(first: IRunnable, ...rest: IRunnable[]): IRunnable {
  return new Alternative([first].concat(rest));
}
export function per(first: IRunnable, ...rest: IRunnable[]): IRunnable {
  return new Permutation([first].concat(rest));
}
export function opt(first: IRunnable): IRunnable {
  return new Optional(first);
}
export function tok(t: new (p: Position, s: string) => any): IRunnable {
  return new Token(functionName(t));
}
export function star(first: IRunnable): IRunnable {
  return new Star(first);
}
export function regex(r: RegExp): IRunnable {
  return new Regex(r);
}
export function plus(first: IRunnable): IRunnable {
  return new Plus(first);
}
export function ver(ver: Version, first: IRunnable): IRunnable {
  return new Vers(ver, first);
}