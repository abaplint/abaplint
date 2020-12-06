import {IStatement} from "./_statement";
import {opts, seq, pers, pluss} from "../combi";
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
                     opts(range));

    const times = seq(Source, "TIMES");

    return seq("DO", opts(pers(pluss(vary), times)));
  }

}