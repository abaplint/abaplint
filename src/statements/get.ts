import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, per, opt, plus, IRunnable} from "../combi";

export class Get extends Statement {

  public static get_matcher(): IRunnable {
    let fields = seq(str("FIELDS"), plus(new Reuse.Field()));

    let options = per(str("LATE"), fields);

    let ret = seq(str("GET"),
                  new Reuse.Target(),
                  opt(options));

    return ret;
  }

}