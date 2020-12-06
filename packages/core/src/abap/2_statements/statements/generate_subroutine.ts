import {IStatement} from "./_statement";
import {verNot, seqs, per} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class GenerateSubroutine implements IStatement {

  public getMatcher(): IStatementRunnable {
    const name = seqs("NAME", Source);
    const message = seqs("MESSAGE", Target);
    const messageid = seqs("MESSAGE-ID", Target);
    const line = seqs("LINE", Target);
    const word = seqs("WORD", Target);
    const offset = seqs("OFFSET", Target);
    const short = seqs("SHORTDUMP-ID", Target);
    const include = seqs("INCLUDE", Target);

    const ret = seqs("GENERATE SUBROUTINE POOL",
                     Source,
                     per(name, message, line, word, include, offset, messageid, short));

    return verNot(Version.Cloud, ret);
  }

}