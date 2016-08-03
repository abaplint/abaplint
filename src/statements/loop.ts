import { Statement } from "./statement";
import * as Combi from "../combi";
import Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;

export class Loop extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let where = opt(seq(str("WHERE"), Reuse.cond()));
    let from = seq(str("FROM"), Reuse.integer());
    return seq(str("LOOP AT"),
               Reuse.source(),
               opt(from),
               opt(seq(alt(str("INTO"), str("ASSIGNING")), Reuse.target())),
               opt(str("TRANSPORTING NO FIELDS")),
               opt(seq(str("FROM"), Reuse.source())),
               opt(seq(str("TO"), Reuse.source())),
               where);
  }

}