import {Expression, seq, opt, altPrio} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {SimpleSource1, Source} from ".";

export class RaiseWith extends Expression {
  public getRunnable(): IStatementRunnable {
    const wit = seq(SimpleSource1,
                    opt(SimpleSource1),
                    opt(SimpleSource1),
                    opt(SimpleSource1));
    // todo: I guess this is from version something?
    const witComplex = seq(Source,
                           opt(Source),
                           opt(Source),
                           opt(Source));
    return seq("WITH", altPrio(witComplex, wit));
  }
}