import {Expression, seq, opt, alt} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {SimpleSource1, Source} from ".";

export class RaiseWith extends Expression {
  public getRunnable(): IStatementRunnable {
    const wit = seq("WITH",
                    SimpleSource1,
                    opt(SimpleSource1),
                    opt(SimpleSource1),
                    opt(SimpleSource1));
    // todo: I guess this is from version something?
    const witComplex = seq("WITH",
                           Source,
                           opt(Source),
                           opt(Source),
                           opt(Source));
    return alt(wit, witComplex);
  }
}