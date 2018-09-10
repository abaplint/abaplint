import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, opt, IRunnable} from "../combi";
import {Target} from "../expressions";

export class Overlay extends Statement {

  public static get_matcher(): IRunnable {
    let only = seq(str("ONLY"), new Reuse.Source());

    let ret = seq(str("OVERLAY"),
                  new Target(),
                  str("WITH"),
                  new Reuse.Source(),
                  opt(only));

    return ret;
  }

}