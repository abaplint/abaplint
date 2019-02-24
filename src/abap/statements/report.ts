import {Statement} from "./_statement";
import {verNot, str, seq, opt, per, IStatementRunnable, tok} from "../combi";
import {Integer, MessageClass, Field, ReportName} from "../expressions";
import {Version} from "../../version";
import {ParenLeft, ParenRightW} from "../tokens";

export class Report extends Statement {

  public getMatcher(): IStatementRunnable {
    const more = seq(tok(ParenLeft), new Integer(), tok(ParenRightW));
    const heading = str("NO STANDARD PAGE HEADING");
    const size = seq(str("LINE-SIZE"), new Integer());
    const count = seq(str("LINE-COUNT"), new Integer(), opt(more));
    const message = seq(str("MESSAGE-ID"), new MessageClass());
    const database = seq(str("USING DATABASE"), new Field());

    const ret = seq(str("REPORT"),
                    opt(new ReportName()),
                    opt(per(heading, size, count, database, message)));

    return verNot(Version.Cloud, ret);
  }

}