import {IStatement} from "./_statement";
import {verNot, str, seq, opt, per} from "../combi";
import {Source, ReportName, MessageClass, FieldLength} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Program implements IStatement {

  public getMatcher(): IStatementRunnable {
    const message = seq("MESSAGE-ID", MessageClass);
    const size = seq("LINE-SIZE", Source);
    const heading = str("NO STANDARD PAGE HEADING");
    const line = seq("LINE-COUNT", Source, opt(FieldLength));
    const options = per(message, size, heading, line);

    const ret = seq("PROGRAM", opt(ReportName), opt(options));

    return verNot(Version.Cloud, ret);
  }

}