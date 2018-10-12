import {Statement} from "./statement";
import {verNot, str, seq, opt, IRunnable} from "../combi";
import {Constant, ReceiveParameters} from "../expressions";
import {Version} from "../../version";

export class Receive extends Statement {

  public get_matcher(): IRunnable {
    let ret = seq(str("RECEIVE RESULTS FROM FUNCTION"),
                  new Constant(),
                  opt(str("KEEPING TASK")),
                  new ReceiveParameters());

    return verNot(Version.Cloud, ret);
  }

}