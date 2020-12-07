import {Expression, seq, plus} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Source} from "./source";

export class PerformUsing extends Expression {
  public getRunnable(): IStatementRunnable {
    const using = seq("USING", plus(Source));

    return using;
  }
}