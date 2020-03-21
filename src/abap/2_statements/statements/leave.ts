import {IStatement} from "./_statement";
import {verNot, str, seq, alt, opt} from "../combi";
import {Source, AndReturn} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Leave implements IStatement {

  public getMatcher(): IStatementRunnable {
    const retu = seq(new AndReturn(), str("TO SCREEN"), new Source());

    const transaction = seq(str("TO TRANSACTION"),
                            new Source(),
                            opt(str("AND SKIP FIRST SCREEN")));

    const ret = seq(str("LEAVE"),
                    opt(alt(str("TO CURRENT TRANSACTION"),
                            seq(opt(str("TO")), str("LIST-PROCESSING"), opt(retu)),
                            str("LIST-PROCESSING"),
                            str("SCREEN"),
                            transaction,
                            str("PROGRAM"),
                            seq(str("TO SCREEN"), new Source()))));

    return verNot(Version.Cloud, ret);
  }

}