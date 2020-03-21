import {IStatement} from "./_statement";
import {verNot, str, seq, opt, alt, per} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CallTransaction implements IStatement {

  public getMatcher(): IStatementRunnable {

    const options = seq(str("OPTIONS FROM"), new Source());
    const messages = seq(str("MESSAGES INTO"), new Target());

    const auth = seq(alt(str("WITH"), str("WITHOUT")), str("AUTHORITY-CHECK"));

    const perm = per(seq(str("UPDATE"), new Source()),
                     str("AND SKIP FIRST SCREEN"),
                     options,
                     messages,
                     seq(str("MODE"), new Source()));

    const ret = seq(str("CALL TRANSACTION"),
                    new Source(),
                    opt(auth),
                    opt(seq(str("USING"), new Source())),
                    opt(perm));

    return verNot(Version.Cloud, ret);
  }

}