import {Statement} from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class LogPoint extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let subkey = seq(str("SUBKEY"), new Reuse.Source());

    let fields = seq(str("FIELDS"), new Reuse.Source());

    let ret = seq(str("LOG-POINT ID"),
                  new Reuse.Source(),
                  opt(subkey),
                  opt(fields));

    return ret;
  }

}