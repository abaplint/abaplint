import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;

export class ModifyDatabase extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let target = alt(Reuse.field(), Reuse.dynamic());

    let ret = seq(str("MODIFY"),
                  target,
                  opt(seq(str("FROM"), Reuse.source())));

    return ret;
  }

}