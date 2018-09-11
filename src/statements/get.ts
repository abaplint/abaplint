import {Statement} from "./statement";
import {str, seq, per, opt, plus, IRunnable} from "../combi";
import {Target, Field} from "../expressions";

export class Get extends Statement {

  public static get_matcher(): IRunnable {
    let fields = seq(str("FIELDS"), plus(new Field()));

    let options = per(str("LATE"), fields);

    let ret = seq(str("GET"),
                  new Target(),
                  opt(options));

    return ret;
  }

}