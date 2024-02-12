import {Expression, seq, opt} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {SimpleSource3} from ".";

export class RaiseWith extends Expression {
  public getRunnable(): IStatementRunnable {
    const wit = seq("WITH",
                    SimpleSource3,
                    opt(SimpleSource3),
                    opt(SimpleSource3),
                    opt(SimpleSource3));
    return wit;
  }
}