import {Expression, seq, plus} from "../combi";
import {Field, Source} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class ReduceNext extends Expression {
  public getRunnable(): IStatementRunnable {
    const fields = seq(Field, "=", Source);
    return seq("NEXT", plus(fields));
  }
}