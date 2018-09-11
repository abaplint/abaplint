import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import {Target, Source} from "../expressions";

export class LoadReport extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("LOAD REPORT"),
                  new Source(),
                  str("PART"),
                  new Source(),
                  str("INTO"),
                  new Target());

    return ret;
  }

}