import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import {Source} from "../expressions";

export class SetParameter extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("SET PARAMETER ID"),
                  new Source(),
                  str("FIELD"),
                  new Source());

    return ret;
  }

}