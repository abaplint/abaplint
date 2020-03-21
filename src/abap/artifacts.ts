import * as Statements from "./2_statements/statements";
import * as Expressions from "./2_statements/expressions";
import * as Structures from "./3_structures/structures";
import {IStructure} from "./3_structures/structures/_structure";
import {Combi, Expression} from "./2_statements/combi";
import {Statement} from "./2_statements/statements/_statement";

export interface IKeyword {
  word: string;
  source: string[];
}

class List {
  private readonly words: IKeyword[];

  public constructor() {
    this.words = [];
  }

  public add(keywords: string[], source: string): void {
    for (const w of keywords) {
      const index = this.find(w);
      if (index >= 0) {
        this.words[index].source.push(source);
      } else {
        this.words.push({word: w, source: [source]});
      }
    }
  }

  public get(): IKeyword[] {
    return this.words;
  }

  private find(keyword: string): number {
    for (let i = 0; i < this.words.length; i++) {
      if (this.words[i].word === keyword) {
        return i;
      }
    }
    return -1;
  }
}

function className(cla: any) {
  return cla.constructor.name;
}

export class Artifacts {

  public static getStructures(): IStructure[] {
    const ret: IStructure[] = [];

    const list: any = Structures;
    for (const key in Structures) {
      if (typeof list[key] === "function") {
        ret.push(new list[key]());
      }
    }

    return ret;
  }

  public static getExpressions(): (new () => Expression)[] {
    const ret: (new () => Expression)[] = [];

    const list: any = Expressions;
    for (const key in Expressions) {
      if (typeof list[key] === "function") {
        ret.push(list[key]);
      }
    }

    return ret;
  }

  public static getStatements(): Statement[] {
    const ret: Statement[] = [];

    const list: any = Statements;
    for (const key in Statements) {
      if (typeof list[key] === "function") {
        ret.push(new list[key]());
      }
    }

    return ret;
  }

  public static getKeywords(): IKeyword[] {
    const list: List = new List();

    for (const stat of this.getStatements()) {
      list.add(Combi.listKeywords(stat.getMatcher()), "statement_" + className(stat));
    }

    for (const expr of this.getExpressions()) {
      list.add(Combi.listKeywords(new expr().getRunnable()), "expression_" + className(expr));
    }

    return list.get();
  }

}