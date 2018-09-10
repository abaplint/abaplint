import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, opt, IRunnable} from "../combi";

export class Overlay extends Statement {

  public static get_matcher(): IRunnable {
    let only = seq(str("ONLY"), new Reuse.Source());

    let ret = seq(str("OVERLAY"),
                  new Reuse.Target(),
                  str("WITH"),
                  new Reuse.Source(),
                  opt(only));

    return ret;
  }

}