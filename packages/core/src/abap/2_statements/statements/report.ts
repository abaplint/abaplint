import {IStatement} from "./_statement";
import {verNot, str, seqs, opts, per, tok} from "../combi";
import {Integer, MessageClass, Field, ReportName} from "../expressions";
import {Version} from "../../../version";
import {ParenLeft, ParenRightW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class Report implements IStatement {

  public getMatcher(): IStatementRunnable {
    const more = seqs(tok(ParenLeft), Integer, tok(ParenRightW));
    const heading = str("NO STANDARD PAGE HEADING");
    const size = seqs("LINE-SIZE", Integer);
    const count = seqs("LINE-COUNT", Integer, opts(more));
    const message = seqs("MESSAGE-ID", MessageClass);
    const database = seqs("USING DATABASE", Field);

    const ret = seqs("REPORT",
                     opts(ReportName),
                     opts(per(heading, size, count, database, message)));

    return verNot(Version.Cloud, ret);
  }

}