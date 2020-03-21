import {seq,  Expression, IStatementRunnable, str, alt, opt, plus} from "../combi";
import {Cond, Source, Throw, Let} from ".";

export class CondBody extends Expression {
  public getRunnable(): IStatementRunnable {
    const when = seq(str("WHEN"), new Cond(), str("THEN"), alt(new Source(), new Throw()));

    const elsee = seq(str("ELSE"), alt(new Source(), new Throw()));

    return seq(opt(new Let()),
               plus(when),
               opt(elsee));
  }
}