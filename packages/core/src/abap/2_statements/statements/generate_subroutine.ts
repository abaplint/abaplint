import {IStatement} from "./_statement";
import {verNot, seq, pers} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class GenerateSubroutine implements IStatement {

  public getMatcher(): IStatementRunnable {
    const name = seq("NAME", Source);
    const message = seq("MESSAGE", Target);
    const messageid = seq("MESSAGE-ID", Target);
    const line = seq("LINE", Target);
    const word = seq("WORD", Target);
    const offset = seq("OFFSET", Target);
    const short = seq("SHORTDUMP-ID", Target);
    const include = seq("INCLUDE", Target);

    const ret = seq("GENERATE SUBROUTINE POOL",
                    Source,
                    pers(name, message, line, word, include, offset, messageid, short));

    return verNot(Version.Cloud, ret);
  }

}