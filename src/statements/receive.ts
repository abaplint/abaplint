import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, opt, IRunnable} from "../combi";

export class Receive extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("RECEIVE RESULTS FROM FUNCTION"),
                  new Reuse.Constant(),
                  opt(str("KEEPING TASK")),
                  new Reuse.ReceiveParameters());

    return ret;
  }

}