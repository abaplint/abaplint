import {IStatement} from "./_statement";
import {seq, altPrio, per, opt} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Add implements IStatement {

  public getMatcher(): IStatementRunnable {
    const to = seq("TO", Target);
    const accordingTo = seq("ACCORDING TO", Source);
    const giving = seq("GIVING", Source);
    const then = seq("THEN", Source, "UNTIL", Source, opt(per(giving, accordingTo)), opt(to));

    const ret = seq("ADD", Source, altPrio(to, then));

    return ret;
  }

}