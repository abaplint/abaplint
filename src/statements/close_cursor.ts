import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, IRunnable} from "../combi";

export class CloseCursor extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("CLOSE CURSOR"), new Reuse.Target());
    return ret;
  }

}