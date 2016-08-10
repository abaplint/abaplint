import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;

export class ModifyInternal extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let target = alt(Reuse.field(), seq(str("("), Reuse.field(), str(")")));
    let index = seq(str("INDEX"), Reuse.source());

    let transporting = seq(str("TRANSPORTING"), Reuse.field());

    let ret = seq(str("MODIFY"),
                  target,
                  opt(seq(index, str("FROM"), Reuse.source(), opt(transporting))));

    return ret;
  }

}