import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class CallTransaction extends Statement {

  public static get_matcher(): Combi.IRunnable {

    let ret = seq(str("CALL TRANSACTION"),
                  Reuse.source(),
                  opt(str("AND SKIP FIRST SCREEN")));

    return ret;
  }

}