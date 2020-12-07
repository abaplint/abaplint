import {IStatement} from "./_statement";
import {verNot, seq, alt, opt} from "../combi";
import {Source, AndReturn} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Leave implements IStatement {

  public getMatcher(): IStatementRunnable {
    const retu = seq(AndReturn, "TO SCREEN", Source);

    const transaction = seq("TO TRANSACTION",
                            Source,
                            opt("AND SKIP FIRST SCREEN"));

    const ret = seq("LEAVE",
                    opt(alt("TO CURRENT TRANSACTION",
                            seq(opt("TO"), "LIST-PROCESSING", opt(retu)),
                            "LIST-PROCESSING",
                            "SCREEN",
                            transaction,
                            "PROGRAM",
                            seq("TO SCREEN", Source))));

    return verNot(Version.Cloud, ret);
  }

}