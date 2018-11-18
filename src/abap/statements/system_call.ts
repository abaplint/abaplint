import {Statement} from "./_statement";
import {verNot, str, seq, regex as reg, plus, IRunnable} from "../combi";
import {Version} from "../../version";

export class SystemCall extends Statement {

  public getMatcher(): IRunnable {
    const anyy = reg(/^.+$/);

    const ret = seq(str("SYSTEM-CALL"), plus(anyy));

    return verNot(Version.Cloud, ret);
  }

}