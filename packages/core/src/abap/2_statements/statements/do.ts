import {IStatement} from "./_statement";
import {optPrio, seq, per, plus, verNotLang} from "../combi";
import {LanguageVersion} from "../../../version";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Do implements IStatement {

  public getMatcher(): IStatementRunnable {
    const range = seq("RANGE", Source);

    const vary = seq("VARYING",
                     Target,
                     "FROM",
                     Source,
                     "NEXT",
                     Source,
                     optPrio(range));

    const times = seq(Source, "TIMES");

    return seq("DO", optPrio(per(verNotLang(LanguageVersion.Cloud, plus(vary)), times)));
  }

}