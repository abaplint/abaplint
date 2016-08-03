import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;

export class UpdateDatabase extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let target = alt(Reuse.field(), Reuse.dynamic());

    let ret = seq(str("UPDATE"),
                  target,
                  str("SET"),
                  Reuse.parameter_list_s(),
                  opt(seq(str("WHERE"), Reuse.cond())));

    return ret;
  }

}