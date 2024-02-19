import {Expression, seq, opt} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {SimpleSource1} from ".";

export class RaiseWith extends Expression {
  public getRunnable(): IStatementRunnable {
    const wit = seq("WITH",
                    SimpleSource1,
                    opt(SimpleSource1),
                    opt(SimpleSource1),
                    opt(SimpleSource1));
    return wit;
  }
}