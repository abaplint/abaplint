import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;

export class StaticBegin extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let occurs = seq(str("OCCURS"), new Reuse.Integer());

    let ret = seq(alt(str("STATIC"), str("STATICS")),
                  str("BEGIN OF"),
                  new Reuse.SimpleName(),
                  opt(occurs));

    return ret;
  }

}