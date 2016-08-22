import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;

export class InsertInternal extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let target = alt(Reuse.source(), Reuse.dynamic());
    let assigning = seq(str("ASSIGNING"), Reuse.fs_target());
    let index = seq(str("INDEX"), Reuse.source());
    let initial = str("INITIAL LINE");

    let ret = seq(str("INSERT"),
                  alt(initial,
                      seq(opt(str("LINES OF")), target)),
                  str("INTO"),
                  opt(str("TABLE")),
                  Reuse.source(),
                  opt(index),
                  opt(assigning));

    return ret;
  }

}