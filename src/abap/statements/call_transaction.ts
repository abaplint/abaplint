import {Statement} from "./statement";
import {verNot, str, seq, opt, alt, IRunnable} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../version";

export class CallTransaction extends Statement {

  public get_matcher(): IRunnable {

    let options = seq(str("OPTIONS FROM"), new Source());
    let messages = seq(str("MESSAGES INTO"), new Target());

    let auth = seq(alt(str("WITH"), str("WITHOUT")), str("AUTHORITY-CHECK"));

    let ret = seq(str("CALL TRANSACTION"),
                  new Source(),
                  opt(auth),
                  opt(seq(str("USING"), new Source())),
                  opt(seq(str("MODE"), new Source())),
                  opt(seq(str("UPDATE"), new Source())),
                  opt(str("AND SKIP FIRST SCREEN")),
                  opt(options),
                  opt(messages));

    return verNot(Version.Cloud, ret);
  }

}