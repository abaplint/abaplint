import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, IRunnable} from "../combi";

export class SetMargin extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("SET MARGIN"),
                  new Reuse.Source(),
                  new Reuse.Source());

    return ret;
  }

}