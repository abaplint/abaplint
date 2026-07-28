import {Expression, seq, plus} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {SimpleSource3} from "./simple_source3";

export class PerformUsing extends Expression {
  public getRunnable(): IStatementRunnable {
    const using = seq("USING", plus(SimpleSource3));

    return using;
  }
}