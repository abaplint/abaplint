import {Statement} from "./_statement";
import {verNot, str, seq, IRunnable} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../version";

export class Unpack extends Statement {

  public getMatcher(): IRunnable {
    const ret = seq(str("UNPACK"),
                    new Source(),
                    str("TO"),
                    new Target());

    return verNot(Version.Cloud, ret);
  }

}