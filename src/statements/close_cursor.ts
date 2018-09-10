import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import {Target} from "../expressions";

export class CloseCursor extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("CLOSE CURSOR"), new Target());
    return ret;
  }

}