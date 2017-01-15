import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class Receive extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let ret = seq(str("RECEIVE RESULTS FROM FUNCTION"),
                  new Reuse.Constant(),
                  opt(str("KEEPING TASK")),
                  new Reuse.ReceiveParameters());

    return ret;
  }

}