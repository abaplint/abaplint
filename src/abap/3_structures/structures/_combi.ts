import {IStructure} from "./_structure";
import {StructureNode, StatementNode} from "../../nodes";
import {INode} from "../../nodes/_inode";
import {Statement} from "../../2_statements/statements/_statement";
import {IStructureRunnable} from "./_structure_runnable";
import {IMatch} from "./_match";

class Sequence implements IStructureRunnable {
  private readonly list: IStructureRunnable[];

  public constructor(list: IStructureRunnable[]) {
    if (list.length < 2) {
      throw new Error("Sequence, length error");
    }
    this.list = list;
  }

  public toRailroad() {
    const children = this.list.map((e) => { return e.toRailroad(); });
    return "Railroad.Sequence(" + children.join() + ")";
  }

  public getUsing(): string[] {
    return this.list.reduce((a, c) => { return a.concat(c.getUsing()); }, [] as string[]);
  }

  public run(statements: StatementNode[], parent: INode): IMatch {
    let inn = statements;
    let out: StatementNode[] = [];
    for (const i of this.list) {
      const match = i.run(inn, parent);
      if (match.error) {
        return {
          matched: [],
          unmatched: statements,
          error: true,
          errorDescription: match.errorDescription,
          errorMatched: out.length,
        };
      }
      out = out.concat(match.matched);
      inn = match.unmatched;
    }
    return {
      matched: out,
      unmatched: inn,
      error: false,
      errorDescription: "",
      errorMatched: 0,
    };
  }
}

class Alternative implements IStructureRunnable {
  private readonly list: IStructureRunnable[];

  public constructor(list: IStructureRunnable[]) {
    if (list.length < 2) {
      throw new Error("Alternative, length error");
    }
    this.list = list;
  }

  public toRailroad() {
    const children = this.list.map((e) => { return e.toRailroad(); });
    return "Railroad.Choice(0, " + children.join() + ")";
  }

  public getUsing() {
    return this.list.reduce((a, c) => { return a.concat(c.getUsing()); }, [] as string[]);
  }

  public run(statements: StatementNode[], parent: INode): IMatch {
    let count = 0;
    let countError = "";
    for (const i of this.list) {
      const match = i.run(statements, parent);
      if (match.error === false) {
        return match;
      }
      if (match.errorMatched > count) {
        countError = match.errorDescription;
        count = match.errorMatched;
      }
    }
    const children = this.list.map((e) => { return e.constructor.name.toUpperCase(); });
    if (count === 0) {
      return {
        matched: [],
        unmatched: statements,
        error: true,
        errorDescription: "Expected " + children.join(" or "),
        errorMatched: count,
      };
    } else {
      return {
        matched: [],
        unmatched: statements,
        error: true,
        errorDescription: countError,
        errorMatched: count,
      };
    }
  }
}

class Optional implements IStructureRunnable {
  private readonly obj: IStructureRunnable;

  public constructor(obj: IStructureRunnable) {
    this.obj = obj;
  }

  public toRailroad() {
    return "Railroad.Optional(" + this.obj.toRailroad() + ")";
  }

  public getUsing() {
    return this.obj.getUsing();
  }

  public run(statements: StatementNode[], parent: INode): IMatch {
    const ret = this.obj.run(statements, parent);
    ret.error = false;
    return ret;
  }
}

class Star implements IStructureRunnable {
  private readonly obj: IStructureRunnable;

  public constructor(obj: IStructureRunnable) {
    this.obj = obj;
  }

  public toRailroad() {
    return "Railroad.ZeroOrMore(" + this.obj.toRailroad() + ")";
  }

  public getUsing() {
    return this.obj.getUsing();
  }

  public run(statements: StatementNode[], parent: INode): IMatch {
    let inn = statements;
    let out: StatementNode[] = [];
    // tslint:disable-next-line:no-constant-condition
    while (true) {
      const match = this.obj.run(inn, parent);
      if (inn.length === 0) {
        return {
          matched: out,
          unmatched: inn,
          error: false,
          errorDescription: "",
          errorMatched: 0,
        };
      } else if (match.error === true) {
        if (match.errorMatched > 0) {
          return {
            matched: out,
            unmatched: inn,
            error: true,
            errorDescription: match.errorDescription,
            errorMatched: match.errorMatched,
          };
        } else {
          return {
            matched: out,
            unmatched: inn,
            error: false,
            errorDescription: "",
            errorMatched: 0,
          };
        }
      }
      out = out.concat(match.matched);
      inn = match.unmatched;
    }
  }
}

class SubStructure implements IStructureRunnable {
  private readonly s: IStructure;

  public constructor(s: IStructure) {
    this.s = s;
  }

  public toRailroad() {
    return "Railroad.NonTerminal('" + this.s.constructor.name + "', {href: '#/structure/" + this.s.constructor.name + "'})";
  }

  public getUsing() {
    return ["structure/" + this.s.constructor.name];
  }

  public run(statements: StatementNode[], parent: INode): IMatch {
    const nparent = new StructureNode(this.s);
    const ret = this.s.getMatcher().run(statements, nparent);
    if (ret.matched.length === 0) {
      ret.error = true;
    } else {
      parent.addChild(nparent);
    }
    return ret;
  }
}

class SubStatement implements IStructureRunnable {
  private readonly obj: new () => Statement;

  public constructor(obj: new () => Statement) {
    this.obj = obj;
  }

  public toRailroad() {
    return "Railroad.Terminal('" + this.className() + "', {href: '#/statement/" + this.className() + "'})";
  }

  public getUsing() {
    return ["statement/" + this.className()];
  }

  private className() {
    return this.obj.name;
  }

  public run(statements: StatementNode[], parent: INode): IMatch {
    if (statements.length === 0) {
      return {
        matched: [],
        unmatched: [],
        error: true,
        errorDescription: "Expected " + this.className().toUpperCase(),
        errorMatched: 0,
      };
    } else if (statements[0].get() instanceof this.obj) {
      parent.addChild(statements[0]);
      return {
        matched: [statements[0]],
        unmatched: statements.splice(1),
        error: false,
        errorDescription: "",
        errorMatched: 0,
      };
    } else {
      return {
        matched: [],
        unmatched: statements,
        error: true,
        errorDescription: "Expected " + this.className().toUpperCase(),
        errorMatched: 0,
      };
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

export function sta(s: new () => Statement): IStructureRunnable {
  return new SubStatement(s);
}

export function sub(s: IStructure): IStructureRunnable {
  return new SubStructure(s);
}