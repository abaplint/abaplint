import {IStatement} from "./_statement";
import {verNot, seqs, opts, alts, pers} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CallTransaction implements IStatement {

  public getMatcher(): IStatementRunnable {

    const options = seqs("OPTIONS FROM", Source);
    const messages = seqs("MESSAGES INTO", Target);

    const auth = seqs(alts("WITH", "WITHOUT"), "AUTHORITY-CHECK");

    const perm = pers(seqs("UPDATE", Source),
                      "AND SKIP FIRST SCREEN",
                      options,
                      messages,
                      seqs("MODE", Source));

    const ret = seqs("CALL TRANSACTION",
                     Source,
                     opts(auth),
                     opts(seqs("USING", Source)),
                     opts(perm));

    return verNot(Version.Cloud, ret);
  }

}