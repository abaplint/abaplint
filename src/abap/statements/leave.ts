import {Statement} from "./_statement";
import {verNot, str, seq, alt, opt, IStatementRunnable} from "../combi";
import {Source, AndReturn} from "../expressions";
import {Version} from "../../version";

export class Leave extends Statement {

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