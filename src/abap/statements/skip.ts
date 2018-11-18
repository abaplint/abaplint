import {Statement} from "./_statement";
import {verNot, str, seq, opt, IRunnable} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../version";

export class Skip extends Statement {

  public getMatcher(): IRunnable {
    const ret = seq(str("SKIP"),
                    opt(str("TO LINE")),
                    opt(new Source()));

    return verNot(Version.Cloud, ret);
  }

}