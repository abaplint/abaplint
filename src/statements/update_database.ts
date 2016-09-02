import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;

export class UpdateDatabase extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let target = alt(Reuse.database_table(), Reuse.dynamic());

    let set = seq(str("SET"),
                  Reuse.parameter_list_s(),
                  opt(seq(str("WHERE"), Reuse.cond())));

    let from = seq(str("FROM"), Reuse.source());

    let ret = seq(str("UPDATE"),
                  target,
                  opt(alt(from, set)));

    return ret;
  }

}