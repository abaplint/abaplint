import {Statement} from "./statement";
import {verNot, str, seq, opt, IRunnable} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../version";

export class CreateOLE extends Statement {

  public get_matcher(): IRunnable {
    let ret = seq(str("CREATE OBJECT"),
                  new Target(),
                  new Source(),
                  opt(str("NO FLUSH")),
                  opt(str("QUEUE-ONLY")));

    return verNot(Version.Cloud, ret);
  }

}