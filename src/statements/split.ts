import {Statement} from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let plus = Combi.plus;

export class Split extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let into = alt(seq(str("TABLE"), new Reuse.Target()), plus(new Reuse.Target()));

    let ret = seq(str("SPLIT"),
                  new Reuse.Source(),
                  str("AT"),
                  new Reuse.Source(),
                  str("INTO"),
                  into);
    return ret;
  }

}