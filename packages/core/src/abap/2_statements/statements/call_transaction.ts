import {IStatement} from "./_statement";
import {verNot, str, seqs, opt, alts, per} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CallTransaction implements IStatement {

  public getMatcher(): IStatementRunnable {

    const options = seqs("OPTIONS FROM", Source);
    const messages = seqs("MESSAGES INTO", Target);

    const auth = seqs(alts("WITH", "WITHOUT"), "AUTHORITY-CHECK");

    const perm = per(seqs("UPDATE", Source),
                     str("AND SKIP FIRST SCREEN"),
                     options,
                     messages,
                     seqs("MODE", Source));

    const ret = seqs("CALL TRANSACTION",
                     Source,
                     opt(auth),
                     opt(seqs("USING", Source)),
                     opt(perm));

    return verNot(Version.Cloud, ret);
  }

}