import {Statement} from "./statement";
import {verNot, str, seq, optPrio, IRunnable} from "../combi";
import {Target, Select} from "../expressions";
import {Version} from "../../version";

export class OpenCursor extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("OPEN CURSOR"),
                  optPrio(str("WITH HOLD")),
                  new Target(),
                  str("FOR"),
                  new Select());

    return verNot(Version.Cloud, ret);
  }

}