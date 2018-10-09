import * as Statements from "./statements";
import * as Expressions from "./expressions";
import {Combi, Reuse} from "./combi";

export class KeywordList {

  public static get(): string[] {
    let res: string[] = [];

    for (let st in Statements) {
      const stat: any = Statements;
      if (typeof stat[st].get_matcher === "function") {
        res = res.concat(Combi.listKeywords(stat[st].get_matcher()));
      }
    }

    for (let foo in Expressions) {
      const expr: any = Expressions;
      if (typeof expr[foo] === "function") {
        const e: Reuse = new expr[foo]();
        res = res.concat(Combi.listKeywords(e.get_runnable()));
      }
    }

    res = res.filter((x, i, a) => { return a.indexOf(x) === i; });

// todo
    console.dir(res);
    console.log(res.length);

    return res;
  }

}