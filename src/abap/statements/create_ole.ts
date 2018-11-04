import {Statement} from "./_statement";
import {verNot, str, seq, opt, IRunnable} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../version";

export class CreateOLE extends Statement {

  public getMatcher(): IRunnable {
    let ret = seq(str("CREATE OBJECT"),
                  new Target(),
                  new Source(),
                  opt(str("NO FLUSH")),
                  opt(str("QUEUE-ONLY")));

    return verNot(Version.Cloud, ret);
  }

}