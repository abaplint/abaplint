import {IStatement} from "./_statement";
import {verNot, str, seqs, opts, pers} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class GenerateReport implements IStatement {

  public getMatcher(): IStatementRunnable {

    const without = str("WITHOUT SELECTION-SCREEN");
    const message = seqs("MESSAGE", Target);
    const include = seqs("INCLUDE", Target);
    const line = seqs("LINE", Target);
    const word = seqs("WORD", Target);
    const offset = seqs("OFFSET", Target);
    const headers = str("WITH PRECOMPILED HEADERS");
    const test = str("WITH TEST CODE");
    const messageid = seqs("MESSAGE-ID", Target);
    const trace = seqs("TRACE-FILE", Target);
    const shortdumpid = seqs("SHORTDUMP-ID", Target);
    const directory = seqs("DIRECTORY ENTRY", Target);

    const options = pers(without, message, include, trace, line, word, offset, headers, test, messageid, shortdumpid, directory);

    const ret = seqs("GENERATE REPORT",
                     Source,
                     opts(options));

    return verNot(Version.Cloud, ret);
  }

}