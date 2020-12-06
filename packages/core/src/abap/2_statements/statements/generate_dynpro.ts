import {IStatement} from "./_statement";
import {verNot, seqs, pers} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class GenerateDynpro implements IStatement {

  public getMatcher(): IStatementRunnable {

    const line = seqs("LINE", Target);
    const word = seqs("WORD", Target);

    const ret = seqs("GENERATE DYNPRO",
                     Source,
                     Source,
                     Source,
                     Source,
                     "ID",
                     Source,
                     "MESSAGE",
                     Target,
                     pers(line, word));

    return verNot(Version.Cloud, ret);
  }

}