import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class Overlay extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let only = seq(str("ONLY"), new Reuse.Source());

    let ret = seq(str("OVERLAY"),
                  new Reuse.Target(),
                  str("WITH"),
                  new Reuse.Source(),
                  opt(only));

    return ret;
  }

}