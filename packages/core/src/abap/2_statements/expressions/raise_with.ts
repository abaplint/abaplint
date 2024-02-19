import {Expression, seq, opt} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {SimpleSource2} from ".";

export class RaiseWith extends Expression {
  public getRunnable(): IStatementRunnable {
    const wit = seq("WITH",
                    SimpleSource2,
                    opt(SimpleSource2),
                    opt(SimpleSource2),
                    opt(SimpleSource2));
    return wit;
  }
}