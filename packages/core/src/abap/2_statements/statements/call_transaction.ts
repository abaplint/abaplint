import {IStatement} from "./_statement";
import {verNot, seq, opt, alt, per} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CallTransaction implements IStatement {

  public getMatcher(): IStatementRunnable {

    const options = seq("OPTIONS FROM", Source);
    const messages = seq("MESSAGES INTO", Target);

    const auth = seq(alt("WITH", "WITHOUT"), "AUTHORITY-CHECK");

    const perm = per(seq("UPDATE", Source),
                     "AND SKIP FIRST SCREEN",
                     options,
                     messages,
                     seq("MODE", Source));

    const ret = seq("CALL TRANSACTION",
                    Source,
                    opt(auth),
                    opt(seq("USING", Source)),
                    opt(perm));

    return verNot(Version.Cloud, ret);
  }

}