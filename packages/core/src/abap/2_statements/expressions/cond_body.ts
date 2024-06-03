import {seq, Expression, altPrio, plusPrio, optPrio} from "../combi";
import {Cond, Source, Throw, Let} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class CondBody extends Expression {
  public getRunnable(): IStatementRunnable {
    const when = seq("WHEN", altPrio(Cond, Source), "THEN", altPrio(Throw, Source));

    const elsee = seq("ELSE", altPrio(Throw, Source));

    return seq(optPrio(Let),
               plusPrio(when),
               optPrio(elsee));
  }
}