import {Statement} from "./_statement";
import {verNot, str, seq, opt, alt, per, IStatementRunnable} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../version";

export class CallTransaction extends Statement {

  public getMatcher(): IStatementRunnable {

    const options = seq(str("OPTIONS FROM"), new Source());
    const messages = seq(str("MESSAGES INTO"), new Target());

    const auth = seq(alt(str("WITH"), str("WITHOUT")), str("AUTHORITY-CHECK"));

    const ret = seq(str("CALL TRANSACTION"),
                    new Source(),
                    opt(auth),
                    opt(seq(str("USING"), new Source())),
                    opt(per(seq(str("UPDATE"), new Source()), seq(str("MODE"), new Source()))),
                    opt(str("AND SKIP FIRST SCREEN")),
                    opt(options),
                    opt(messages));

    return verNot(Version.Cloud, ret);
  }

}