import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let optPrio = Combi.optPrio;

export class OpenCursor extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let ret = seq(str("OPEN CURSOR"),
                  optPrio(str("WITH HOLD")),
                  new Reuse.Target(),
                  str("FOR"),
                  new Reuse.Select());

    return ret;
  }

}