import {Statement} from "./_statement";
import {verNot, str, seq, IRunnable} from "../combi";
import {Target} from "../expressions";
import {Version} from "../../version";

export class Refresh extends Statement {

  public getMatcher(): IRunnable {
    const ret = seq(str("REFRESH"), new Target());

    return verNot(Version.Cloud, ret);
  }

}