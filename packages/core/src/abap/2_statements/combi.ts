import * as Tokens from "../1_lexer/tokens";
import {Token as Tokens_Token} from "../1_lexer/tokens/_token";
import {Position} from "../../position";
import {TokenNode, ExpressionNode, TokenNodeRegex} from "../nodes";
import {Version} from "../../version";
import {IStatementRunnable} from "./statement_runnable";
import {Result} from "./result";

class Regex implements IStatementRunnable {

  private readonly regexp: RegExp;

  public constructor(r: RegExp) {
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
      if (input.remainingLength() === 0) {
        continue;
      }
      const token = input.peek();
      if (this.regexp.test(token.getStr()) === true) {
        result.push(input.shift(new TokenNodeRegex(token)));
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
    return [""];
  }
}

class Word implements IStatementRunnable {

  private readonly s: string;

  public constructor(s: string) {
    this.s = s.toUpperCase();
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
      if (input.remainingLength() !== 0
          && input.peek().getStr().toUpperCase() === this.s) {
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
    return [this.s];
  }
}

class Token implements IStatementRunnable {

  private readonly name: string;

  public constructor(s: string) {
    this.name = s.toUpperCase();
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
      if (input.remainingLength() !== 0
          && input.peek().constructor.name.toUpperCase() === this.name) {
        result.push(input.shift(new TokenNode(input.peek())));
      }
    }
    return result;
  }

  public railroad() {
    let text = this.name;

    const toke: any = Tokens;
    for (const token in Tokens) {
      if (token.toUpperCase() === this.name && toke[token].railroad) {
        text = toke[token].railroad();
        break;
      }
    }
    return "Railroad.Terminal('!\"" + text + "\"')";
  }

  public toStr() {
    return "Token \"" + this.name + "\"";
  }

  public first() {
    return [""];
  }
}

class Vers implements IStatementRunnable {

  private readonly version: Version;
  private readonly or: Version | undefined;
  private readonly runnable: IStatementRunnable;

  public constructor(version: Version, runnable: IStatementRunnable, or?: Version) {
    this.version = version;
    this.runnable = runnable;
    this.or = or;
  }

  public listKeywords(): string[] {
    return this.runnable.listKeywords();
  }

  public run(r: Result[]): Result[] {
    const targetVersion = Combi.getVersion();
    if (this.or && targetVersion === this.or) {
      return this.runnable.run(r);
    } else if (targetVersion === Version.OpenABAP) {
      if (this.version > Version.v702) {
        return [];
      } else {
        return this.runnable.run(r);
      }
    } else if (targetVersion >= this.version || targetVersion === Version.Cloud) {
      return this.runnable.run(r);
    } else {
      return [];
    }
  }

  public getUsing(): string[] {
    return this.runnable.getUsing();
  }

  public railroad() {
    let text: string = this.version;
    if (this.or) {
      text += " or " + this.or;
    }
    return "Railroad.Sequence(Railroad.Comment(\"" +
      text +
      "\", {}), " +
      this.runnable.railroad() +
      ")";
  }

  public toStr() {
    return "Version(" + this.runnable.toStr() + ")";
  }

  public first() {
    return this.runnable.first();
  }
}

class VersNot implements IStatementRunnable {

  private readonly version: Version;
  private readonly runnable: IStatementRunnable;

  public constructor(version: Version, runnable: IStatementRunnable) {
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
    return this.runnable.first();
  }
}

class OptionalPriority implements IStatementRunnable {

  private readonly optional: IStatementRunnable;

  public constructor(optional: IStatementRunnable) {
    this.optional = optional;
  }

  public listKeywords(): string[] {
    return this.optional.listKeywords();
  }

  public getUsing(): string[] {
    return this.optional.getUsing();
  }

  public run(r: Result[]): Result[] {
    const result: Result[] = [];

    for (const input of r) {
      const res = this.optional.run([input]);
      if (res.length > 1) {
        result.push(...res);
      } else if (res.length === 0) {
        result.push(input);
      } else if (res[0].remainingLength() < input.remainingLength()) {
        result.push(...res);
      } else {
        result.push(input);
      }
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
    return [""];
  }
}

class Optional implements IStatementRunnable {

  private readonly optional: IStatementRunnable;

  public constructor(optional: IStatementRunnable) {
    this.optional = optional;
  }

  public listKeywords(): string[] {
    return this.optional.listKeywords();
  }

  public getUsing(): string[] {
    return this.optional.getUsing();
  }

  public run(r: Result[]): Result[] {
    const result: Result[] = [];

    for (const input of r) {
      result.push(input);
      const res = this.optional.run([input]);
      result.push(...res);
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
    return [""];
  }
}

class Star implements IStatementRunnable {

  private readonly sta: IStatementRunnable;

  public constructor(sta: IStatementRunnable) {
    this.sta = sta;
  }

  public listKeywords(): string[] {
    return this.sta.listKeywords();
  }

  public getUsing(): string[] {
    return this.sta.getUsing();
  }

  public run(r: Result[]): Result[] {
    const result = r;

    let res = r;
    let input: Result[] = [];
    for (;;) {
      input = res;
      res = this.sta.run(input);

      if (res.length === 0) {
        break;
      }

      result.push(...res);
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
    return [""];
  }
}

class StarPrioroity implements IStatementRunnable {

  private readonly sta: IStatementRunnable;

  public constructor(sta: IStatementRunnable) {
    this.sta = sta;
  }

  public listKeywords(): string[] {
    return this.sta.listKeywords();
  }

  public getUsing(): string[] {
    return this.sta.getUsing();
  }

  public run(r: Result[]): Result[] {
    let result: Result[] = r;

    let res = r;
//    let input: Result[] = [];
    let prev: Result[] | undefined;
    for (;;) {
//      input = res;
      res = this.sta.run(res);

      if (res.length === 0) {
        if (prev !== undefined) {
//          console.log("star length: " + prev.length);
          let best = Number.MAX_SAFE_INTEGER;
          for (const p of prev) {
            if (p.remainingLength() < best) {
              result = [p];
              best = p.remainingLength();
            }
          }
        }
        break;
      }

      prev = res;
    }

    return result;
  }

  public railroad() {
    return "Railroad.ZeroOrMore(" + this.sta.railroad() + ")";
  }

  public toStr() {
    return "star(" + this.sta.toStr() + ")";
  }

  public first() {
    return [""];
  }
}

class Plus implements IStatementRunnable {

  private readonly plu: IStatementRunnable;
  private readonly sub: Sequence;

  public constructor(plu: IStatementRunnable) {
    this.plu = plu;
    this.sub = new Sequence([this.plu, new Star(this.plu)]);
  }

  public listKeywords(): string[] {
    return this.plu.listKeywords();
  }

  public getUsing(): string[] {
    return this.plu.getUsing();
  }

  public run(r: Result[]): Result[] {
    return this.sub.run(r);
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

class PlusPriority implements IStatementRunnable {

  private readonly plu: IStatementRunnable;
  private readonly sub: Sequence;

  public constructor(plu: IStatementRunnable) {
    this.plu = plu;
    this.sub = new Sequence([this.plu, new StarPrioroity(this.plu)]);
  }

  public listKeywords(): string[] {
    return this.plu.listKeywords();
  }

  public getUsing(): string[] {
    return this.plu.getUsing();
  }

  public run(r: Result[]): Result[] {
    return this.sub.run(r);
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

  public constructor(list: IStatementRunnable[]) {
    if (list.length < 2) {
      throw new Error("Sequence, length error");
    }
    this.list = list;
  }

  public listKeywords(): string[] {
    const ret: string[] = [];
    for (const i of this.list) {
      ret.push(...i.listKeywords());
    }
    return ret;
  }

  public getUsing(): string[] {
    return this.list.reduce((a, c) => { return a.concat(c.getUsing()); }, [] as string[]);
  }

  public run(r: Result[]): Result[] {
    const result: Result[] = [];

    for (const input of r) {
      let temp = [input];
      let match = true;
      for (const sequence of this.list) {
        temp = sequence.run(temp);
        if (temp.length === 0) {
          match = false;
          break;
        }
      }

      if (match === true) {
        result.push(...temp);
      }
    }

    return result;
  }

  public railroad() {
    const children = this.list.map((e) => { return e.railroad(); });
    return "Railroad.Sequence(" + children.join() + ")";
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
  private readonly seq: Sequence;

  public constructor(stri: string) {
    this.stri = stri;

    const foo = this.stri.replace(/-/g, " - ");
    const split = foo.split(" ");

    for (const st of split) {
// todo, use Dash token
      this.words.push(new Word(st));
    }
    this.seq = new Sequence(this.words);
  }

  public listKeywords(): string[] {
    return [this.stri.toString()];
  }

  public getUsing(): string[] {
    return [];
  }

  public run(r: Result[]): Result[] {
    return this.seq.run(r);
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
  private runnable: IStatementRunnable | undefined = undefined;

  public run(r: Result[]): Result[] {
    const results: Result[] = [];

    if (this.runnable === undefined) {
      this.runnable = this.getRunnable();
    }

    for (const input of r) {
      const temp = this.runnable.run([input]);

      for (const t of temp) {
        let consumed = input.remainingLength() - t.remainingLength();
        if (consumed > 0) {
          const originalLength = t.getNodes().length;
          const children: (ExpressionNode | TokenNode)[] = [];
          while (consumed > 0) {
            const sub = t.popNode();
            if (sub) {
              children.push(sub);
              consumed = consumed - sub.countTokens();
            }
          }
          const re = new ExpressionNode(this);
          re.setChildren(children.reverse());

          const n = t.getNodes().slice(0, originalLength - consumed);
          n.push(re);
          t.setNodes(n);
        }
        results.push(t);
      }

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
    return this.constructor.name;
  }

  public railroad() {
    return "Railroad.NonTerminal('" + this.getName() + "', {href: '#/expression/" + this.getName() + "'})";
  }

  public toStr() {
    return "expression(" + this.getName() + ")";
  }

  public first() {
    return this.getRunnable().first();
  }
}

class Permutation implements IStatementRunnable {
  private readonly list: IStatementRunnable[];

  public constructor(list: IStatementRunnable[]) {
    if (list.length < 2) {
      throw new Error("Permutation, length error, got " + list.length);
    }
    this.list = list;
  }

  public listKeywords(): string[] {
    const ret: string[] = [];
    for (const i of this.list) {
      ret.push(...i.listKeywords());
    }
    return ret;
  }

  public getUsing() {
    return this.list.reduce((a, c) => { return a.concat(c.getUsing()); }, [] as string[]);
  }

  public run(r: Result[]): Result[] {
    const result: Result[] = [];

    const copy = this.list.slice();
    for (let index = 0; index < this.list.length; index++) {
      const temp = this.list[index].run(r);
      if (temp.length !== 0) {
// match
        result.push(...temp);

        const left = copy;
        left.splice(index, 1);
        if (left.length === 1) {
          result.push(...left[0].run(temp));
        } else {
          result.push(...new Permutation(left).run(temp));
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
    return [""];
  }
}

class Alternative implements IStatementRunnable {
  private readonly list: IStatementRunnable[];

  public constructor(list: IStatementRunnable[]) {
    if (list.length < 2) {
      throw new Error("Alternative, length error");
    }
    this.list = list;
  }

  public listKeywords(): string[] {
    const ret: string[] = [];
    for (const i of this.list) {
      ret.push(...i.listKeywords());
    }
    return ret;
  }

  public getUsing() {
    return this.list.reduce((a, c) => { return a.concat(c.getUsing()); }, [] as string[]);
  }

  public run(r: Result[]): Result[] {
    const result: Result[] = [];

    for (const sequ of this.list) {
      const temp = sequ.run(r);
      result.push(...temp);
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
    if (this.list.length !== 2) {
      return [""];
    }
    const f1 = this.list[0].first();
    const f2 = this.list[1].first();
    if (f1.length === 1 && f1[0] === "") {
      return f1;
    }
    if (f2.length === 1 && f2[0] === "") {
      return f2;
    }
    if (f1.length === 1 && f2.length === 1 && f1[0] === f2[0]) {
      return f1;
    }
    f1.push(...f2);
    return f1;
  }
}

// prioritized alternative, skip others if match found
class AlternativePriority implements IStatementRunnable {
  private readonly list: IStatementRunnable[];

  public constructor(list: IStatementRunnable[]) {
    if (list.length < 2) {
      throw new Error("Alternative, length error");
    }
    this.list = list;
  }

  public listKeywords(): string[] {
    const ret: string[] = [];
    for (const i of this.list) {
      ret.push(...i.listKeywords());
    }
    return ret;
  }

  public getUsing() {
    return this.list.reduce((a, c) => { return a.concat(c.getUsing()); }, [] as string[]);
  }

  public run(r: Result[]): Result[] {
    const result: Result[] = [];

    for (const sequ of this.list) {
//      console.log(seq.toStr());
      const temp = sequ.run(r);

      if (temp.length > 0) {
        result.push(...temp);
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
    if (this.list.length !== 2) {
      return [""];
    }
    const f1 = this.list[0].first();
    const f2 = this.list[1].first();
    if (f1.length === 1 && f1[0] === "") {
      return f1;
    }
    if (f2.length === 1 && f2[0] === "") {
      return f2;
    }
    if (f1.length === 1 && f2.length === 1 && f1[0] === f2[0]) {
      return f1;
    }
    f1.push(...f2);
    return f1;
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
  public static run(
    runnable: IStatementRunnable,
    tokens: readonly Tokens_Token[], version: Version): (ExpressionNode | TokenNode)[] | undefined {

    this.ver = version;

    const input = new Result(tokens, 0);
    const result = runnable.run([input]);
/*
    console.log("res: " + result.length);
    for (const res of result) {
      console.dir(res.getNodes().map(n => n.get().constructor.name));
      console.dir(res.getNodes().map(n => n.concatTokens()));
    }
*/
    for (const res of result) {
      if (res.remainingLength() === 0) {
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

export function regex(r: RegExp): IStatementRunnable {
  return new Regex(r);
}

export function tok(t: new (p: Position, s: string) => any): IStatementRunnable {
  return new Token(t.name);
}

const singletons: {[index: string]: Expression} = {};
type InputType = (new () => Expression) | string | IStatementRunnable;
function map(s: InputType): IStatementRunnable {
  const type = typeof s;
  if (type === "string") {
    return str(s as string);
  } else if (type === "function") {
    // @ts-ignore
    const name = s.name;
    if (singletons[name] === undefined) {
      // @ts-ignore
      singletons[name] = new s();
    }
    return singletons[name];
  } else {
    return s as IStatementRunnable;
  }
}
export function seq(first: InputType, second: InputType, ...rest: InputType[]): IStatementRunnable {
  const list = [map(first), map(second)];
  list.push(...rest.map(map));
  return new Sequence(list);
}
export function alt(first: InputType, second: InputType, ...rest: InputType[]): IStatementRunnable {
  const list = [map(first), map(second)];
  list.push(...rest.map(map));
  return new Alternative(list);
}
export function altPrio(first: InputType, second: InputType, ...rest: InputType[]): IStatementRunnable {
  const list = [map(first), map(second)];
  list.push(...rest.map(map));
  return new AlternativePriority(list);
}
export function opt(first: InputType): IStatementRunnable {
  return new Optional(map(first));
}
export function optPrio(first: InputType): IStatementRunnable {
  return new OptionalPriority(map(first));
}
export function per(first: InputType, second: InputType, ...rest: InputType[]): IStatementRunnable {
  const list = [map(first), map(second)];
  list.push(...rest.map(map));
  return new Permutation(list);
}
export function star(first: InputType): IStatementRunnable {
  return new Star(map(first));
}
export function starPrio(first: InputType): IStatementRunnable {
  return new StarPrioroity(map(first));
}
export function plus(first: InputType): IStatementRunnable {
  return new Plus(map(first));
}
export function plusPrio(first: InputType): IStatementRunnable {
  return new PlusPriority(map(first));
}
export function ver(version: Version, first: InputType, or?: Version): IStatementRunnable {
  return new Vers(version, map(first), or);
}
export function verNot(version: Version, first: InputType): IStatementRunnable {
  return new VersNot(version, map(first));
}