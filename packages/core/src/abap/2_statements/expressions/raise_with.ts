import {Expression, seq, opt} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Source} from ".";

export class RaiseWith extends Expression {
  public getRunnable(): IStatementRunnable {
    const wit = seq("WITH",
                    Source,
                    opt(Source),
                    opt(Source),
                    opt(Source));
    return wit;
  }
}