import {IStatement} from "./_statement";
import {opt, seq, per, plus} from "../combi";
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
                     opt(range));

    const times = seq(Source, "TIMES");

    return seq("DO", opt(per(plus(vary), times)));
  }

}