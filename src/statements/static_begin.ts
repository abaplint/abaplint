import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, alt, opt, IRunnable} from "../combi";

export class StaticBegin extends Statement {

  public static get_matcher(): IRunnable {
    let occurs = seq(str("OCCURS"), new Reuse.Integer());

    let ret = seq(alt(str("STATIC"), str("STATICS")),
                  str("BEGIN OF"),
                  new Reuse.SimpleName(),
                  opt(occurs));

    return ret;
  }

}