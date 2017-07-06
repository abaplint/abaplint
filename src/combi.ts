import * as Tokens from "./tokens/";
import Position from "./position";
import {TokenNode, BasicNode, ReuseNode, CountableNode} from "./node";
import {Version, versionDescription} from "../src/version";

export class Result {
  private tokens: Array<Tokens.Token>;
  private nodes: Array<CountableNode>;

  constructor(a: Array<Tokens.Token>, n?: Array<CountableNode>) {
// tokens: not yet matched
// nodes: matched tokens
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

//    console.log(this.regexp.toString());

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
//        console.log("match, " + this.s + result.length);
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
}

class Vers implements IRunnable {

  private version: Version;
  private runnable: IRunnable;

  constructor(version: Version, runnable: IRunnable) {
    this.version = version;
    this.runnable = runnable;
  }

  public run(r: Array<Result>): Array<Result> {
    if (Combi.getVersion() >= this.version) {
      return this.runnable.run(r);
    } else {
      return [];
    }
  }

  public railroad() {
    return "Railroad.Sequence(Railroad.Comment(\"" +
      versionDescription(this.version) +
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

class OptionalPriority implements IRunnable {

  private optional: IRunnable;

  constructor(optional: IRunnable) {
    this.optional = optional;
  }

  public run(r: Array<Result>): Array<Result> {
    let result: Array<Result> = [];

    for (let input of r) {
      let res = this.optional.run([input]);
      if (res.length > 1) {
        result.push(input);
        result = result.concat(res);
//      } else if (res.length === 1) {
//        result = result.concat(res);
      } else if (res.length === 0) {
        result.push(input);
      } else if (res[0].length() < input.length()) {
        result = result.concat(res);
      } else {
        result.push(input);
      }
/*
      console.dir(res);
      console.dir(result);
*/
    }

    return result;
  }

  public railroad() {
    return "Railroad.Optional(" + this.optional.railroad() + ")";
  }

  public toStr() {
    return "opt(" + this.optional.toStr() + ")";
  }

  public first() {
    return "";
  }
}

class Optional implements IRunnable {

  private optional: IRunnable;

  constructor(optional: IRunnable) {
    this.optional = optional;
  }

  public run(r: Array<Result>): Array<Result> {
    let result: Array<Result> = [];

    for (let input of r) {
      result.push(input);
      let res = this.optional.run([input]);
      result = result.concat(res);
    }

    return result;
  }

  public railroad() {
    return "Railroad.Optional(" + this.optional.railroad() + ")";
  }

  public toStr() {
    return "opt(" + this.optional.toStr() + ")";
  }

  public first() {
    return "";
  }
}

class Star implements IRunnable {

  private sta: IRunnable;

  constructor(sta: IRunnable) {
    this.sta = sta;
  }

  public run(r: Array<Result>): Array<Result> {
    let result = r;

    let res = r;
    let input: Array<Result> = [];
    for ( ; ; ) {
      input = res;
      res = this.sta.run(input);

      if (res.length === 0) {
        break;
      }

      result = result.concat(res);
    }
//    console.dir(result);
    return result;
  }

  public railroad() {
    return "Railroad.ZeroOrMore(" + this.sta.railroad() + ")";
  }

  public toStr() {
    return "star(" + this.sta.toStr() + ")";
  }

  public first() {
    return "";
  }
}

class Plus implements IRunnable {

  private plu: IRunnable;

  constructor(plu: IRunnable) {
    this.plu = plu;
  }

  public run(r: Array<Result>): Array<Result> {
    return new Sequence([this.plu, new Star(this.plu)]).run(r);
  }

  public railroad() {
    return "Railroad.OneOrMore(" + this.plu.railroad() + ")";
  }

  public toStr() {
    return "plus(" + this.plu.toStr() + ")";
  }

  public first() {
    return this.plu.first();
  }
}

class Sequence implements IRunnable {
  private list: Array<IRunnable>;
  private stack: boolean;

  constructor(list: IRunnable[], stack = false) {
    if (list.length < 2) {
      throw new Error("Sequence, length error");
    }
    this.list = list;
    this.stack = stack;
  }

  public run(r: Array<Result>): Array<Result> {
    let result: Array<Result> = [];

    for (let input of r) {
      let temp = [input];
      for (let sequence of this.list) {
        temp = sequence.run(temp);
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
    if (this.stack === true) {
      return "Railroad.Stack(" + children.join() + ")";
    } else {
      return "Railroad.Sequence(" + children.join() + ")";
    }
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

  private stri: String;
  private words: Array<IRunnable> = [];

  constructor(stri: String) {
    this.stri = stri;

    let foo = this.stri.replace(/-/g, " - ");
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
    return "Railroad.Terminal('\"" + this.stri + "\"')";
  }

  public toStr() {
    return "str(" + this.stri + ")";
  }

  public first() {
    return this.words[0].first();
  }
}

export abstract class Reuse implements IRunnable {
  public run(r: Array<Result>): Array<Result> {
    let results: Array<Result> = [];

//    console.dir(r);
    for (let input of r) {
//      console.dir(input);
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
//    console.dir(results);
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
    let result: Array<Result> = [];

    for (let index = 0; index < this.list.length; index++) {
      let temp = this.list[index].run(r);
/*
console.dir(r);
console.log(this.list[index].toStr());
console.dir(temp);
console.log("sdf");
*/
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
/*
console.log("per result");
console.dir(result);
*/
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

    for (let sequ of this.list) {
      let temp = sequ.run(r);
      result = result.concat(temp);
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

// prioritized alternative, skip others if match found
class AlternativePriority implements IRunnable {
  private list: Array<IRunnable>;

  constructor(list: IRunnable[]) {
    if (list.length < 2) {
      throw new Error("Alternative, length error");
    }
    this.list = list;
  }

  public run(r: Array<Result>): Array<Result> {
    let result: Array<Result> = [];

    for (let sequ of this.list) {
//      console.log(seq.toStr());
      let temp = sequ.run(r);

      result = result.concat(temp);

      if (temp.length > 0) {
        break;
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

// assumption: no pgragmas supplied in tokens input
  public static run(runnable: IRunnable, tokens: Array<Tokens.Token>, version = Version.v750): BasicNode[] {
    this.ver = version;

    let input = new Result(tokens);
    let result = runnable.run([input]);
//    console.log("res: " + result.length);
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
export function seqs(first: IRunnable, ...rest: IRunnable[]): IRunnable {
  return new Sequence([first].concat(rest), true);
}
export function alt(first: IRunnable, ...rest: IRunnable[]): IRunnable {
  return new Alternative([first].concat(rest));
}
export function altPrio(first: IRunnable, ...rest: IRunnable[]): IRunnable {
  return new AlternativePriority([first].concat(rest));
}
export function per(first: IRunnable, ...rest: IRunnable[]): IRunnable {
  return new Permutation([first].concat(rest));
}
export function opt(first: IRunnable): IRunnable {
  return new Optional(first);
}
export function optPrio(first: IRunnable): IRunnable {
  return new OptionalPriority(first);
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
export function ver(version: Version, first: IRunnable): IRunnable {
  return new Vers(version, first);
}