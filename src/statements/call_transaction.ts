import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class CallTransaction extends Statement {

  public static get_matcher(): Combi.IRunnable {

    let ret = seq(str("CALL TRANSACTION"),
                  new Reuse.Source(),
                  opt(str("WITH AUTHORITY-CHECK")),
                  opt(seq(str("USING"), new Reuse.Source())),
                  opt(seq(str("MODE"), new Reuse.Source())),
                  opt(str("AND SKIP FIRST SCREEN")));

    return ret;
  }

}