import {Statement} from "./statement";
import {str, seq, alt, IRunnable} from "../combi";
import {SimpleName} from "../expressions";

export class StaticEnd extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(alt(str("STATIC"), str("STATICS")),
                  str("END OF"),
                  new SimpleName());

    return ret;
  }

}