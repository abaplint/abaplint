import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;

export class StaticEnd extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let ret = seq(alt(str("STATIC"), str("STATICS")),
                  str("END OF"),
                  new Reuse.SimpleName());

    return ret;
  }

}