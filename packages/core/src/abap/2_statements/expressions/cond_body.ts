import {seq, Expression, alts, opts, pluss} from "../combi";
import {Cond, Source, Throw, Let} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class CondBody extends Expression {
  public getRunnable(): IStatementRunnable {
    const when = seq("WHEN", Cond, "THEN", alts(Source, Throw));

    const elsee = seq("ELSE", alts(Source, Throw));

    return seq(opts(Let),
               pluss(when),
               opts(elsee));
  }
}