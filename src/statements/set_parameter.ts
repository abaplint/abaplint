import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, IRunnable} from "../combi";

export class SetParameter extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("SET PARAMETER ID"),
                  new Reuse.Source(),
                  str("FIELD"),
                  new Reuse.Source());

    return ret;
  }

}