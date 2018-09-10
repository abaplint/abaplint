import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, alt, IRunnable} from "../combi";

export class StaticEnd extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(alt(str("STATIC"), str("STATICS")),
                  str("END OF"),
                  new Reuse.SimpleName());

    return ret;
  }

}