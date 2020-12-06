import {IStatement} from "./_statement";
import {verNot, seq, alts, opts} from "../combi";
import {Source, AndReturn} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Leave implements IStatement {

  public getMatcher(): IStatementRunnable {
    const retu = seq(AndReturn, "TO SCREEN", Source);

    const transaction = seq("TO TRANSACTION",
                            Source,
                            opts("AND SKIP FIRST SCREEN"));

    const ret = seq("LEAVE",
                    opts(alts("TO CURRENT TRANSACTION",
                              seq(opts("TO"), "LIST-PROCESSING", opts(retu)),
                              "LIST-PROCESSING",
                              "SCREEN",
                              transaction,
                              "PROGRAM",
                              seq("TO SCREEN", Source))));

    return verNot(Version.Cloud, ret);
  }

}