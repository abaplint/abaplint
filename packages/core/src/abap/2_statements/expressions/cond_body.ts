import {seq, Expression, alt, opt, plus} from "../combi";
import {Cond, Source, Throw, Let} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class CondBody extends Expression {
  public getRunnable(): IStatementRunnable {
    const when = seq("WHEN", Cond, "THEN", alt(Source, Throw));

    const elsee = seq("ELSE", alt(Source, Throw));

    return seq(opt(Let),
               plus(when),
               opt(elsee));
  }
}