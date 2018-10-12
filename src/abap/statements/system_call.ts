import {Statement} from "./statement";
import {verNot, str, seq, regex as reg, plus, IRunnable} from "../combi";
import {Version} from "../../version";

export class SystemCall extends Statement {

  public get_matcher(): IRunnable {
    let anyy = reg(/^.+$/);

    let ret = seq(str("SYSTEM-CALL"), plus(anyy));

    return verNot(Version.Cloud, ret);
  }

}