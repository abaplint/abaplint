import {Statement} from "./statement";
import {str, seq, opt, IRunnable} from "../combi";
import {Target, Source} from "../expressions";

export class Transfer extends Statement {

  public static get_matcher(): IRunnable {
    let length = seq(str("LENGTH"),
                     new Source());

    let ret = seq(str("TRANSFER"),
                  new Source(),
                  str("TO"),
                  new Target(),
                  opt(length));

    return ret;
  }

}