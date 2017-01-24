import {Statement} from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let per = Combi.per;

export class ReadReport extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let state = seq(str("STATE"), new Reuse.Source());
    let into = seq(str("INTO"), new Reuse.Target());
    let maximum = seq(str("MAXIMUM WIDTH INTO"), new Reuse.Target());

    return seq(str("READ REPORT"),
               new Reuse.Source(),
               per(state, into, maximum));
  }

}