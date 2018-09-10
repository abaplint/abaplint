import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, optPrio, IRunnable} from "../combi";

export class OpenCursor extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("OPEN CURSOR"),
                  optPrio(str("WITH HOLD")),
                  new Reuse.Target(),
                  str("FOR"),
                  new Reuse.Select());

    return ret;
  }

}