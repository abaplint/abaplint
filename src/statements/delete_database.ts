import { Statement } from "./statement";
import * as Combi from "../combi";
import Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;

export class DeleteDatabase extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let where = seq(str("WHERE"), alt(Reuse.cond(), Reuse.dynamic()));
    let source = alt(Reuse.dynamic(), Reuse.field());

    let ret = seq(str("DELETE"), str("FROM"), source, opt(where));

    return ret;
  }

}