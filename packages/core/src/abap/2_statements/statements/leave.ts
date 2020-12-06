import {IStatement} from "./_statement";
import {verNot, seqs, alts, opts} from "../combi";
import {Source, AndReturn} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Leave implements IStatement {

  public getMatcher(): IStatementRunnable {
    const retu = seqs(AndReturn, "TO SCREEN", Source);

    const transaction = seqs("TO TRANSACTION",
                             Source,
                             opts("AND SKIP FIRST SCREEN"));

    const ret = seqs("LEAVE",
                     opts(alts("TO CURRENT TRANSACTION",
                               seqs(opts("TO"), "LIST-PROCESSING", opts(retu)),
                               "LIST-PROCESSING",
                               "SCREEN",
                               transaction,
                               "PROGRAM",
                               seqs("TO SCREEN", Source))));

    return verNot(Version.Cloud, ret);
  }

}