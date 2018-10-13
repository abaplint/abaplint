import {Structure} from "./_structure";

export interface IStructureRunnable {
  toRailroad(): string;
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
}

class Optional implements IStructureRunnable {
  private obj: IStructureRunnable;

  constructor(obj: IStructureRunnable) {
    this.obj = obj;
  }

  public toRailroad() {
    return "Railroad.Optional(" + this.obj.toRailroad() + ")";
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
}

class SubStructure implements IStructureRunnable {
  private s: Structure;

  constructor(s: Structure) {
    this.s = s;
  }

  public toRailroad() {
    return "Railroad.NonTerminal('" + this.s.constructor.name + "', 'structure_" + this.s.constructor.name + ".svg')";
  }

}

class Statement implements IStructureRunnable {
  private obj: any;

  constructor(obj: any) {
    this.obj = obj;
  }

  public toRailroad() {
    return "Railroad.Terminal('" + this.className(this.obj) + "', 'statement_" + this.className(this.obj) + ".svg')";
  }

  private className(cla: any) {
    return (cla + "").match(/\w+/g)[1];
  }

}

class BeginEnd implements IStructureRunnable {
  private begin: IStructureRunnable;
  private end: IStructureRunnable;
  private body: IStructureRunnable;

  constructor(begin: IStructureRunnable, body: IStructureRunnable, end: IStructureRunnable) {
    this.begin = begin;
    this.body = body;
    this.end = end;
  }

  public toRailroad() {
    let children = [this.begin.toRailroad(), this.body.toRailroad(), this.end.toRailroad()];
    return "Railroad.Sequence(" + children + ")";
  }
}

export function seq(first: IStructureRunnable, ...rest: IStructureRunnable[]): IStructureRunnable {
  return new Sequence([first].concat(rest));
}

export function alt(first: IStructureRunnable, ...rest: IStructureRunnable[]): IStructureRunnable {
  return new Alternative([first].concat(rest));
}

export function beginEnd(begin: IStructureRunnable, body: IStructureRunnable, end: IStructureRunnable): IStructureRunnable {
  return new BeginEnd(begin, body, end);
}

export function opt(o: IStructureRunnable): IStructureRunnable {
  return new Optional(o);
}

export function star(s: IStructureRunnable): IStructureRunnable {
  return new Star(s);
}

export function sta(s: Object): IStructureRunnable {
  return new Statement(s);
}

export function sub(s: Structure): IStructureRunnable {
  return new SubStructure(s);
}