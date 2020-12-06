import {IStatement} from "./_statement";
import {opts, seqs, pers, pluss} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Do implements IStatement {

  public getMatcher(): IStatementRunnable {
    const range = seqs("RANGE", Source);

    const vary = seqs("VARYING",
                      Target,
                      "FROM",
                      Source,
                      "NEXT",
                      Source,
                      opts(range));

    const times = seqs(Source, "TIMES");

    return seqs("DO", opts(pers(pluss(vary), times)));
  }

}