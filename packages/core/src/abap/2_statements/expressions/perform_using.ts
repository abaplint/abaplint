import {str, Expression, seq, plus} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Source} from "./source";

export class PerformUsing extends Expression {
  public getRunnable(): IStatementRunnable {
    const using = seq(str("USING"), plus(new Source()));

    return using;
  }
}