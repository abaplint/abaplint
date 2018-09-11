import {Statement} from "./statement";
import {str, seq, opt, IRunnable} from "../combi";
import {Target, Source} from "../expressions";

export class Overlay extends Statement {

  public static get_matcher(): IRunnable {
    let only = seq(str("ONLY"), new Source());

    let ret = seq(str("OVERLAY"),
                  new Target(),
                  str("WITH"),
                  new Source(),
                  opt(only));

    return ret;
  }

}