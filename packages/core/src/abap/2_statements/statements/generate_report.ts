import {IStatement} from "./_statement";
import {verNot, str, seq, opt, pers} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class GenerateReport implements IStatement {

  public getMatcher(): IStatementRunnable {

    const without = str("WITHOUT SELECTION-SCREEN");
    const message = seq("MESSAGE", Target);
    const include = seq("INCLUDE", Target);
    const line = seq("LINE", Target);
    const word = seq("WORD", Target);
    const offset = seq("OFFSET", Target);
    const headers = str("WITH PRECOMPILED HEADERS");
    const test = str("WITH TEST CODE");
    const messageid = seq("MESSAGE-ID", Target);
    const trace = seq("TRACE-FILE", Target);
    const shortdumpid = seq("SHORTDUMP-ID", Target);
    const directory = seq("DIRECTORY ENTRY", Target);

    const options = pers(without, message, include, trace, line, word, offset, headers, test, messageid, shortdumpid, directory);

    const ret = seq("GENERATE REPORT",
                    Source,
                    opt(options));

    return verNot(Version.Cloud, ret);
  }

}