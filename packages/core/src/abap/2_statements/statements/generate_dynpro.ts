import {IStatement} from "./_statement";
import {verNot, seq, per} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class GenerateDynpro implements IStatement {

  public getMatcher(): IStatementRunnable {

    const line = seq("LINE", Target);
    const word = seq("WORD", Target);

    const ret = seq("GENERATE DYNPRO",
                    Source,
                    Source,
                    Source,
                    Source,
                    "ID",
                    Source,
                    "MESSAGE",
                    Target,
                    per(line, word));

    return verNot(Version.Cloud, ret);
  }

}