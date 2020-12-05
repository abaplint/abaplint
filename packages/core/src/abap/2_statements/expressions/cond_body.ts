import {seqs, Expression, alt, opt, plus} from "../combi";
import {Cond, Source, Throw, Let} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class CondBody extends Expression {
  public getRunnable(): IStatementRunnable {
    const when = seqs("WHEN", Cond, "THEN", alt(new Source(), new Throw()));

    const elsee = seqs("ELSE", alt(new Source(), new Throw()));

    return seqs(opt(new Let()),
                plus(when),
                opt(elsee));
  }
}