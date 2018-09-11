import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import {Target, Source} from "../expressions";

export class GetParameter extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("GET PARAMETER ID"),
                  new Source(),
                  str("FIELD"),
                  new Target());

    return ret;
  }

}