import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let opt = Combi.opt;
let seq = Combi.seq;
let per = Combi.per;
let plus = Combi.plus;

export class Do extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let vary = seq(str("VARYING"),
                   new Reuse.Target(),
                   str("FROM"),
                   new Reuse.Source(),
                   str("NEXT"),
                   new Reuse.Source());

    let times = seq(new Reuse.Source(), str("TIMES"));

    return seq(str("DO"), opt(per(plus(vary), times)));
  }

  public isStructure() {
    return true;
  }

  public indentationEnd() {
    return 2;
  }

}