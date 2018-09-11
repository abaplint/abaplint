import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import {Target, Source} from "../expressions";

export class Add extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("ADD"),
                  new Source(),
                  str("TO"),
                  new Target());

    return ret;
  }

}