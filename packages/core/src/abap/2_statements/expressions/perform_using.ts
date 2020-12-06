import {Expression, seq, pluss} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Source} from "./source";

export class PerformUsing extends Expression {
  public getRunnable(): IStatementRunnable {
    const using = seq("USING", pluss(Source));

    return using;
  }
}