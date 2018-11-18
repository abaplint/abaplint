import {Statement} from "./_statement";
import {verNot, str, seq, IRunnable} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../version";

export class Pack extends Statement {

  public getMatcher(): IRunnable {
    const ret = seq(str("PACK"), new Source(), str("TO"), new Target());

    return verNot(Version.Cloud, ret);
  }

}