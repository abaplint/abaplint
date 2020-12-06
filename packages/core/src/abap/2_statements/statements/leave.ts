import {IStatement} from "./_statement";
import {verNot, str, seqs, alt, opt} from "../combi";
import {Source, AndReturn} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Leave implements IStatement {

  public getMatcher(): IStatementRunnable {
    const retu = seqs(AndReturn, "TO SCREEN", Source);

    const transaction = seqs("TO TRANSACTION",
                             Source,
                             opt(str("AND SKIP FIRST SCREEN")));

    const ret = seqs("LEAVE",
                     opt(alt(str("TO CURRENT TRANSACTION"),
                             seqs(opt(str("TO")), "LIST-PROCESSING", opt(retu)),
                             str("LIST-PROCESSING"),
                             str("SCREEN"),
                             transaction,
                             str("PROGRAM"),
                             seqs("TO SCREEN", Source))));

    return verNot(Version.Cloud, ret);
  }

}