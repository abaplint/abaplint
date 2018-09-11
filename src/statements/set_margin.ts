import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import {Source} from "../expressions";

export class SetMargin extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("SET MARGIN"),
                  new Source(),
                  new Source());

    return ret;
  }

}