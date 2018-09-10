import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import * as Reuse from "./reuse";

export class LoadReport extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("LOAD REPORT"),
                  new Reuse.Source(),
                  str("PART"),
                  new Reuse.Source(),
                  str("INTO"),
                  new Reuse.Target());

    return ret;
  }

}