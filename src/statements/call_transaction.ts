import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;

export class CallTransaction extends Statement {

  public static get_matcher(): Combi.IRunnable {

    let options = seq(str("OPTIONS FROM"), new Reuse.Source());
    let messages = seq(str("MESSAGES INTO"), new Reuse.Target());

    let auth = seq(alt(str("WITH"), str("WITHOUT")), str("AUTHORITY-CHECK"));

    let ret = seq(str("CALL TRANSACTION"),
                  new Reuse.Source(),
                  opt(auth),
                  opt(seq(str("USING"), new Reuse.Source())),
                  opt(seq(str("MODE"), new Reuse.Source())),
                  opt(seq(str("UPDATE"), new Reuse.Source())),
                  opt(str("AND SKIP FIRST SCREEN")),
                  opt(options),
                  opt(messages));

    return ret;
  }

}