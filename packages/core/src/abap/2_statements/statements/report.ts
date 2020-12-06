import {IStatement} from "./_statement";
import {verNot, str, seq, opt, pers, tok} from "../combi";
import {Integer, MessageClass, Field, ReportName} from "../expressions";
import {Version} from "../../../version";
import {ParenLeft, ParenRightW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class Report implements IStatement {

  public getMatcher(): IStatementRunnable {
    const more = seq(tok(ParenLeft), Integer, tok(ParenRightW));
    const heading = str("NO STANDARD PAGE HEADING");
    const size = seq("LINE-SIZE", Integer);
    const count = seq("LINE-COUNT", Integer, opt(more));
    const message = seq("MESSAGE-ID", MessageClass);
    const database = seq("USING DATABASE", Field);

    const ret = seq("REPORT",
                    opt(ReportName),
                    opt(pers(heading, size, count, database, message)));

    return verNot(Version.Cloud, ret);
  }

}