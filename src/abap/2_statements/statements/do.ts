import {IStatement} from "./_statement";
import {str, opt, seq, per, plus, IStatementRunnable} from "../combi";
import {Target, Source} from "../expressions";

export class Do implements IStatement {

  public getMatcher(): IStatementRunnable {
    const range = seq(str("RANGE"), new Source());

    const vary = seq(str("VARYING"),
                     new Target(),
                     str("FROM"),
                     new Source(),
                     str("NEXT"),
                     new Source(),
                     opt(range));

    const times = seq(new Source(), str("TIMES"));

    return seq(str("DO"), opt(per(plus(vary), times)));
  }

}