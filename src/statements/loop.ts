import { Statement } from "./statement";
import * as Combi from "../combi";
import Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;
let per = Combi.per;

export class Loop extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let where = seq(str("WHERE"), Reuse.cond());

    let into = alt(seq(alt(seq(opt(str("REFERENCE")), str("INTO")), str("ASSIGNING")), Reuse.target()),
                   str("TRANSPORTING NO FIELDS"));

    let from = seq(str("FROM"), Reuse.source());

    let to = seq(str("TO"), Reuse.source());

    let usingKey = seq(str("USING KEY"), Reuse.source());

    let options = per(into, from, to, where, usingKey);

    return seq(str("LOOP AT"),
               Reuse.source(),
               opt(options));
  }

}