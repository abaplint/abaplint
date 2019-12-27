import * as Tokens from "./tokens";
import {Token as Tokens_Token} from "./tokens/_token";
import {Position} from "../position";
import {TokenNode, ExpressionNode, TokenNodeRegex} from "./nodes/";
import {Version} from "../version";
import {CountableNode} from "./nodes/_countable_node";
import {INode} from "./nodes/_inode";

export class Result {
  private readonly tokens: Tokens_Token[];
  private nodes: CountableNode[] | undefined;

  constructor(a: Tokens_Token[], n?: CountableNode[]) {
// tokens: not yet matched
// nodes: matched tokens
    this.tokens = a;
    this.nodes = n;
    if (this.nodes === undefined) {
      this.nodes = [];
    }
  }

  public peek(): Tokens_Token {
    return this.tokens[0];
  }

  public shift(node: CountableNode): Result {
    const copy = this.tokens.slice();
    copy.shift();
    if (this.nodes) {
      const cp = this.nodes.slice();
      if (node) {
        cp.push(node);
      }
      return new Result(copy, cp);
    } else {
      throw new Error("shift, error");
    }
  }

  public getTokens(): Tokens_Token[] {
    return this.tokens;
  }

  public popNode(): CountableNode | undefined {
    if (!this.nodes) {
      throw new Error("popNode, error");
    }
    return this.nodes.pop();
  }

  public getNodes(): CountableNode[] {
    if (!this.nodes) {
      throw new Error("getNodes, error");
    }
    return this.nodes;
  }

  public setNodes(n: CountableNode[]): void {
    this.nodes = n;
  }

  public length(): number {
    return this.tokens.length;
  }

  public toStr(): string {
    let ret = "";
    for (const token of this.tokens) {
      ret = ret + " " + token.getStr();
    }
    return ret;
  }
}

export interface IStatementRunnable {
  run(r: Result[]): Result[];
  railroad(): string;
  toStr(): string;
  getUsing(): string[];
  listKeywords(): string[];
// return first keyword, blank if not applicable
  first(): string;
}

class Regex implements IStatementRunnable {

  private readonly regexp: RegExp;

  constructor(r: RegExp) {
    this.regexp = r;
  }

  public listKeywords(): string[] {
    return [];
  }

  public getUsing(): string[] {
    return [];
  }

  public run(r: Result[]): Result[] {
    const result: Result[] = [];

    for (const input of r) {
      if (input.length() !== 0
          && this.regexp.test(input.peek().getStr()) === true) {
        result.push(input.shift(new TokenNodeRegex(input.peek())));
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

class Word implements IStatementRunnable {

  private readonly s: string;

  constructor(s: string) {
    this.s = s;
  }

  public listKeywords(): string[] {
    return [this.s];
  }

  public getUsing(): string[] {
    return [];
  }

  public run(r: Result[]): Result[] {
    const result: Result[] = [];

    for (const input of r) {
      if (input.length() !== 0
          && input.peek().getStr().toUpperCase() === this.s.toUpperCase()) {
//        console.log("match, " + this.s + result.length);
        result.push(input.shift(new TokenNode(input.peek())));
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

function className(cla: Expression) {
  return cla.constructor.name;
}

function className2(cla: Tokens_Token) {
  return cla.constructor.name;
}

function functionName(fun: any) {
  return fun.name;
}

class Token implements IStatementRunnable {

  private readonly s: string;

  constructor(s: string) {
    this.s = s;
  }

  public listKeywords(): string[] {
    return [];
  }

  public getUsing(): string[] {
    return [];
  }

  public run(r: Result[]): Result[] {
    const result: Result[] = [];

    for (const input of r) {
      if (input.length() !== 0
          && className2(input.peek()).toUpperCase() === this.s.toUpperCase()) {
        result.push(input.shift(new TokenNode(input.peek())));
      }
    }
    return result;
  }

  public railroad() {
    let text = this.s;

    for (const token in Tokens) {
      const toke: any = Tokens;
      if (token === this.s && toke[token].railroad) {
        text = toke[token].railroad();
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

class Vers implements IStatementRunnable {

  private readonly version: Version;
  private readonly runnable: IStatementRunnable;

  constructor(version: Version, runnable: IStatementRunnable) {
    this.version = version;
    this.runnable = runnable;
  }

  public listKeywords(): string[] {
    return this.runnable.listKeywords();
  }

  public run(r: Result[]): Result[] {
    if (Combi.getVersion() >= this.version) {
      return this.runnable.run(r);
    } else {
      return [];
    }
  }

  public getUsing(): string[] {
    return this.runnable.getUsing();
  }

  public railroad() {
    return "Railroad.Sequence(Railroad.Comment(\"" +
      this.version +
      "\", {}), " +
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

class VersNot implements IStatementRunnable {

  private readonly version: Version;
  private readonly runnable: IStatementRunnable;

  constructor(version: Version, runnable: IStatementRunnable) {
    this.version = version;
    this.runnable = runnable;
  }

  public listKeywords(): string[] {
    return this.runnable.listKeywords();
  }

  public getUsing(): string[] {
    return this.runnable.getUsing();
  }

  public run(r: Result[]): Result[] {
    if (Combi.getVersion() !== this.version) {
      return this.runnable.run(r);
    } else {
      return [];
    }
  }

  public railroad() {
    return "Railroad.Sequence(Railroad.Comment(\"not " +
      this.version +
      "\", {}), " +
      this.runnable.railroad() +
      ")";
  }

  public toStr() {
    return "VersionNot(" + this.runnable.toStr() + ")";
  }

  public first() {
    return "";
  }
}

class OptionalPriority implements IStatementRunnable {

  private readonly optional: IStatementRunnable;

  constructor(optional: IStatementRunnable) {
    this.optional = optional;
  }

  public listKeywords(): string[] {
    return this.optional.listKeywords();
  }

  public getUsing(): string[] {
    return this.optional.getUsing();
  }

  public run(r: Result[]): Result[] {
    let result: Result[] = [];

    for (const input of r) {
      const res = this.optional.run([input]);
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

class Optional implements IStatementRunnable {

  private readonly optional: IStatementRunnable;

  constructor(optional: IStatementRunnable) {
    this.optional = optional;
  }

  public listKeywords(): string[] {
    return this.optional.listKeywords();
  }

  public getUsing(): string[] {
    return this.optional.getUsing();
  }

  public run(r: Result[]): Result[] {
    let result: Result[] = [];

    for (const input of r) {
      result.push(input);
      const res = this.optional.run([input]);
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

class Star implements IStatementRunnable {

  private readonly sta: IStatementRunnable;

  constructor(sta: IStatementRunnable) {
    this.sta = sta;
  }

  public listKeywords(): string[] {
    return this.sta.listKeywords();
  }

  public getUsing(): string[] {
    return this.sta.getUsing();
  }

  public run(r: Result[]): Result[] {
    let result = r;

    let res = r;
    let input: Result[] = [];
    for (;;) {
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

class Plus implements IStatementRunnable {

  private readonly plu: IStatementRunnable;

  constructor(plu: IStatementRunnable) {
    this.plu = plu;
  }

  public listKeywords(): string[] {
    return this.plu.listKeywords();
  }

  public getUsing(): string[] {
    return this.plu.getUsing();
  }

  public run(r: Result[]): Result[] {
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

class Sequence implements IStatementRunnable {
  private readonly list: IStatementRunnable[];
  private readonly stack: boolean;

  constructor(list: IStatementRunnable[], stack = false) {
    if (list.length < 2) {
      throw new Error("Sequence, length error");
    }
    this.list = list;
    this.stack = stack;
  }

  public listKeywords(): string[] {
    let ret: string[] = [];
    for (const i of this.list) {
      ret = ret.concat(i.listKeywords());
    }
    return ret;
  }

  public getUsing(): string[] {
    return this.list.reduce((a, c) => { return a.concat(c.getUsing()); }, [] as string[]);
  }

  public run(r: Result[]): Result[] {
    let result: Result[] = [];

    for (const input of r) {
      let temp = [input];
      for (const sequence of this.list) {
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
    const children = this.list.map((e) => { return e.railroad(); });
    if (this.stack === true) {
      return "Railroad.Stack(" + children.join() + ")";
    } else {
      return "Railroad.Sequence(" + children.join() + ")";
    }
  }

  public toStr() {
    let ret = "";
    for (const i of this.list) {
      ret = ret + i.toStr() + ",";
    }
    return "seq(" + ret + ")";
  }

  public first() {
    return this.list[0].first();
  }
}

class WordSequence implements IStatementRunnable {

  private readonly stri: string;
  private readonly words: IStatementRunnable[] = [];

  constructor(stri: string) {
    this.stri = stri;

    const foo = this.stri.replace(/-/g, " - ");
    const split = foo.split(" ");

    for (const st of split) {
// todo, use Dash token
      this.words.push(new Word(st));
    }
  }

  public listKeywords(): string[] {
// todo, will this work?
    return [this.stri.toString()];
  }

  public getUsing(): string[] {
    return [];
  }

  public run(r: Result[]): Result[] {
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

export abstract class Expression implements IStatementRunnable {
  public run(r: Result[]): Result[] {
    let results: Result[] = [];

    for (const input of r) {
      const temp = this.getRunnable().run([input]);

      const moo: Result[] = [];
      for (const t of temp) {
        let consumed = input.length() - t.length();
        if (consumed > 0) {
          const length = t.getNodes().length;
          const re = new ExpressionNode(this);
          const children: CountableNode[] = [];
          while (consumed > 0) {
            const sub = t.popNode();
            if (sub) {
              children.push(sub);
              consumed = consumed - sub.countTokens();
            }
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

  public abstract getRunnable(): IStatementRunnable;

  public listKeywords(): string[] {
// do not recurse, all Expressions are evaluated only on first level
    return [];
  }

  public getUsing(): string[] {
    return ["expression/" + this.getName()];
  }

  public getName(): string {
    return className(this);
  }

  public railroad() {
    return "Railroad.NonTerminal('" + this.getName() + "', {href: '#/expression/" + this.getName() + "'})";
  }

  public toStr() {
    return "expression(" + this.getName() + ")";
  }

  public first() {
    return "";
  }
}

class Permutation implements IStatementRunnable {
  private readonly list: IStatementRunnable[];

  constructor(list: IStatementRunnable[]) {
    if (list.length < 2) {
      throw new Error("Permutation, length error, got " + list.length);
    }
    this.list = list;
  }

  public listKeywords(): string[] {
    let ret: string[] = [];
    for (const i of this.list) {
      ret = ret.concat(i.listKeywords());
    }
    return ret;
  }

  public getUsing() {
    return this.list.reduce((a, c) => { return a.concat(c.getUsing()); }, [] as string[]);
  }

  public run(r: Result[]): Result[] {
    let result: Result[] = [];

    for (let index = 0; index < this.list.length; index++) {
      const temp = this.list[index].run(r);
      if (temp.length !== 0) {
// match
        result = result.concat(temp);

        const left = this.list;
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
    const children = this.list.map((e) => { return e.railroad(); });
    return "Railroad.MultipleChoice(0, 'any'," + children.join() + ")";
  }

  public toStr() {
    const children = this.list.map((e) => { return e.toStr(); });
    return "per(" + children.join() + ")";
  }

  public first() {
    return "";
  }
}

class Alternative implements IStatementRunnable {
  private readonly list: IStatementRunnable[];

  constructor(list: IStatementRunnable[]) {
    if (list.length < 2) {
      throw new Error("Alternative, length error");
    }
    this.list = list;
  }

  public listKeywords(): string[] {
    let ret: string[] = [];
    for (const i of this.list) {
      ret = ret.concat(i.listKeywords());
    }
    return ret;
  }

  public getUsing() {
    return this.list.reduce((a, c) => { return a.concat(c.getUsing()); }, [] as string[]);
  }

  public run(r: Result[]): Result[] {
    let result: Result[] = [];

    for (const sequ of this.list) {
      const temp = sequ.run(r);
      result = result.concat(temp);
    }

    return result;
  }

  public railroad() {
    const children = this.list.map((e) => { return e.railroad(); });
    return "Railroad.Choice(0, " + children.join() + ")";
  }

  public toStr() {
    let ret = "";
    for (const i of this.list) {
      ret = ret + i.toStr() + ",";
    }
    return "alt(" + ret + ")";
  }

  public first() {
    return "";
  }
}

// prioritized alternative, skip others if match found
class AlternativePriority implements IStatementRunnable {
  private readonly list: IStatementRunnable[];

  constructor(list: IStatementRunnable[]) {
    if (list.length < 2) {
      throw new Error("Alternative, length error");
    }
    this.list = list;
  }

  public listKeywords(): string[] {
    let ret: string[] = [];
    for (const i of this.list) {
      ret = ret.concat(i.listKeywords());
    }
    return ret;
  }

  public getUsing() {
    return this.list.reduce((a, c) => { return a.concat(c.getUsing()); }, [] as string[]);
  }

  public run(r: Result[]): Result[] {
    let result: Result[] = [];

    for (const sequ of this.list) {
//      console.log(seq.toStr());
      const temp = sequ.run(r);

      result = result.concat(temp);

      if (temp.length > 0) {
        break;
      }
    }

    return result;
  }

  public railroad() {
    const children = this.list.map((e) => { return e.railroad(); });
    return "Railroad.Choice(0, " + children.join() + ")";
  }

  public toStr() {
    let ret = "";
    for (const i of this.list) {
      ret = ret + i.toStr() + ",";
    }
    return "alt(" + ret + ")";
  }

  public first() {
    return "";
  }
}

export class Combi {
// todo, change this class to be instantiated, constructor(runnable) ?

  private static ver: Version;

  public static railroad(runnable: IStatementRunnable, complex = false): string {
// todo, move method to graph.js?
    let type = "Railroad.Diagram(";
    if (complex === true) {
      type = "Railroad.ComplexDiagram(";
    }

    const result = "Railroad.Diagram.INTERNAL_ALIGNMENT = 'left';\n" +
      type +
      runnable.railroad() +
      ").toString();";
    return result;
  }

  public static listKeywords(runnable: IStatementRunnable): string[] {
// todo, move these walkers of the syntax tree to some abstraction?
    let res = runnable.listKeywords();
// remove duplicates
    res = res.filter((x, i, a) => { return a.indexOf(x) === i; });
    return res;
  }

// assumption: no pragmas supplied in tokens input
  public static run(runnable: IStatementRunnable, tokens: Tokens_Token[], version: Version): INode[] | undefined {
    this.ver = version;

    const input = new Result(tokens);
    const result = runnable.run([input]);
//    console.log("res: " + result.length);
    for (const res of result) {
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

export function str(s: string): IStatementRunnable {
  if (s.indexOf(" ") > 0 || s.indexOf("-") > 0) {
    return new WordSequence(s);
  } else {
    return new Word(s);
  }
}
export function seq(first: IStatementRunnable, ...rest: IStatementRunnable[]): IStatementRunnable {
  return new Sequence([first].concat(rest));
}
export function seqs(first: IStatementRunnable, ...rest: IStatementRunnable[]): IStatementRunnable {
  return new Sequence([first].concat(rest), true);
}
export function alt(first: IStatementRunnable, ...rest: IStatementRunnable[]): IStatementRunnable {
  return new Alternative([first].concat(rest));
}
export function altPrio(first: IStatementRunnable, ...rest: IStatementRunnable[]): IStatementRunnable {
  return new AlternativePriority([first].concat(rest));
}
export function per(first: IStatementRunnable, ...rest: IStatementRunnable[]): IStatementRunnable {
  return new Permutation([first].concat(rest));
}
export function opt(first: IStatementRunnable): IStatementRunnable {
  return new Optional(first);
}
export function optPrio(first: IStatementRunnable): IStatementRunnable {
  return new OptionalPriority(first);
}
export function tok(t: new (p: Position, s: string) => any): IStatementRunnable {
  return new Token(functionName(t));
}
export function star(first: IStatementRunnable): IStatementRunnable {
  return new Star(first);
}
export function regex(r: RegExp): IStatementRunnable {
  return new Regex(r);
}
export function plus(first: IStatementRunnable): IStatementRunnable {
  return new Plus(first);
}
export function ver(version: Version, first: IStatementRunnable): IStatementRunnable {
  return new Vers(version, first);
}
export function verNot(version: Version, first: IStatementRunnable): IStatementRunnable {
  return new VersNot(version, first);
}