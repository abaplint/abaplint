import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;

export class ModifyLine extends Statement {

  public static get_matcher(): Combi.IRunnable {

    let field = seq(str("FIELD VALUE"), new Reuse.Source());
    let from = seq(str("FROM"), new Reuse.Source());
    let index = seq(str("INDEX"), new Reuse.Source());

    let ret = seq(str("MODIFY"),
                  alt(str("CURRENT LINE"),
                      seq(str("LINE"), new Reuse.Source())),
                  opt(index),
                  opt(field),
                  opt(from));

    return ret;
  }

}