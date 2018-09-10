import {Statement} from "./statement";
import {str, seq, alt, plus, IRunnable} from "../combi";
import * as Reuse from "./reuse";

export class Split extends Statement {

  public static get_matcher(): IRunnable {
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