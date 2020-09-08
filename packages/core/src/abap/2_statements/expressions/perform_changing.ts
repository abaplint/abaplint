import {str, Expression, seq, plus} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Source} from "./source";

export class PerformChanging extends Expression {
  public getRunnable(): IStatementRunnable {
    const changing = seq(str("CHANGING"), plus(new Source()));

    return changing;
  }
}