import {Structure} from "./_structure";
import {Statement} from "../statements/statement";

export interface IMatch {
  matched: Array<Statement>;
  unmatched: Array<Statement>;
  error: boolean;
  errorDescription: string;
}

export interface IStructureRunnable {
  toRailroad(): string;
  getUsing(): string[];
  run(statements: Array<Statement>): IMatch;
}

class Sequence implements IStructureRunnable {
  private list: Array<IStructureRunnable>;

  constructor(list: IStructureRunnable[]) {
    if (list.length < 2) {
      throw new Error("Sequence, length error");
    }
    this.list = list;
  }

  public toRailroad() {
    const children = this.list.map((e) => { return e.toRailroad(); });
    return "Railroad.Sequence(" + children.join() + ")";
  }

  public getUsing() {
    return this.list.reduce((a, c) => { return a.concat(c.getUsing()); }, []);
  }

  public run(statements: Array<Statement>): IMatch {
    let inn = statements;
    let out: Array<Statement> = [];
    for (let i of this.list) {
      let match = i.run(inn);
      if (match.error) {
        return {matched: [], unmatched: statements, error: true, errorDescription: match.errorDescription};
      }
      out = out.concat(match.matched);
      inn = match.unmatched;
    }
    return {matched: out, unmatched: inn, error: false, errorDescription: ""};
  }
}

class Alternative implements IStructureRunnable {
  private list: Array<IStructureRunnable>;

  constructor(list: IStructureRunnable[]) {
    if (list.length < 2) {
      throw new Error("Alternative, length error");
    }
    this.list = list;
  }

  public toRailroad() {
    let children = this.list.map((e) => { return e.toRailroad(); });
    return "Railroad.Choice(0, " + children.join() + ")";
  }

  public getUsing() {
    return this.list.reduce((a, c) => { return a.concat(c.getUsing()); }, []);
  }

  public run(statements: Array<Statement>): IMatch {
    for (let i of this.list) {
      const match = i.run(statements);
      if (match.error === false) {
        return match;
      }
    }
    let children = this.list.map((e) => { return e.constructor.name; });
    return {matched: [], unmatched: statements, error: true, errorDescription: "Expected " + children.join(" or ")};
  }
}

class Optional implements IStructureRunnable {
  private obj: IStructureRunnable;

  constructor(obj: IStructureRunnable) {
    this.obj = obj;
  }

  public toRailroad() {
    return "Railroad.Optional(" + this.obj.toRailroad() + ")";
  }

  public getUsing() {
    return this.obj.getUsing();
  }

  public run(statements: Array<Statement>): IMatch {
    let ret = this.obj.run(statements);
    ret.error = false;
    return ret;
  }
}

class Star implements IStructureRunnable {
  private obj: IStructureRunnable;

  constructor(obj: IStructureRunnable) {
    if (obj === undefined) {
      throw new Error("Star, input undefined");
    }
    this.obj = obj;
  }

  public toRailroad() {
    return "Railroad.ZeroOrMore(" + this.obj.toRailroad() + ")";
  }

  public getUsing() {
    return this.obj.getUsing();
  }

  public run(statements: Array<Statement>): IMatch {
    let inn = statements;
    let out: Array<Statement> = [];
    // tslint:disable-next-line:no-constant-condition
    while (true) {
      let match = this.obj.run(inn);
      if (match.error === true || inn.length === 0) {
        return {matched: out, unmatched: inn, error: false, errorDescription: ""};
      }
      out = out.concat(match.matched);
      inn = match.unmatched;
    }
  }
}

class SubStructure implements IStructureRunnable {
  private s: Structure;

  constructor(s: Structure) {
    this.s = s;
  }

  public toRailroad() {
    return "Railroad.NonTerminal('" + this.s.constructor.name + "', '#/structure/" + this.s.constructor.name + "')";
  }

  public getUsing() {
    return ["structure/" + this.s.constructor.name];
  }

  public run(statements: Array<Statement>): IMatch {
    let ret = this.s.getMatcher().run(statements);
    if (ret.matched.length === 0) {
      ret.error = true;
      ret.errorDescription = "Expected " + this.s.constructor.name;
    }
    return ret;
  }
}

class SubStatement implements IStructureRunnable {
  private obj: any;

  constructor(obj: any) {
    this.obj = obj;
  }

  public toRailroad() {
    return "Railroad.Terminal('" + this.className() + "', '#/statement/" + this.className() + "')";
  }

  public getUsing() {
    return ["statement/" + this.className()];
  }

  private className() {
    return (this.obj + "").match(/\w+/g)[1];
  }

  public run(statements: Array<Statement>): IMatch {
    if (statements.length === 0) {
      return {matched: [], unmatched: [], error: true, errorDescription: "Expected " + this.className()};
    } else if (statements[0] instanceof this.obj) {
      return {matched: [statements[0]], unmatched: statements.splice(1), error: false, errorDescription: ""};
    } else {
      return {matched: [], unmatched: statements, error: true, errorDescription: "Expected " + this.className()};
    }
  }
}

export function seq(first: IStructureRunnable, ...rest: IStructureRunnable[]): IStructureRunnable {
  return new Sequence([first].concat(rest));
}

export function alt(first: IStructureRunnable, ...rest: IStructureRunnable[]): IStructureRunnable {
  return new Alternative([first].concat(rest));
}

export function beginEnd(begin: IStructureRunnable, body: IStructureRunnable, end: IStructureRunnable): IStructureRunnable {
  return new Sequence([begin, body, end]);
}

export function opt(o: IStructureRunnable): IStructureRunnable {
  return new Optional(o);
}

export function star(s: IStructureRunnable): IStructureRunnable {
  return new Star(s);
}

export function sta(s: Object): IStructureRunnable {
  return new SubStatement(s);
}

export function sub(s: Structure): IStructureRunnable {
  return new SubStructure(s);
}