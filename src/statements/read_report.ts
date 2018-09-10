import {Statement} from "./statement";
import {str, seq, per, IRunnable} from "../combi";
import * as Reuse from "./reuse";

export class ReadReport extends Statement {

  public static get_matcher(): IRunnable {
    let state = seq(str("STATE"), new Reuse.Source());
    let into = seq(str("INTO"), new Reuse.Target());
    let maximum = seq(str("MAXIMUM WIDTH INTO"), new Reuse.Target());

    return seq(str("READ REPORT"),
               new Reuse.Source(),
               per(state, into, maximum));
  }

}