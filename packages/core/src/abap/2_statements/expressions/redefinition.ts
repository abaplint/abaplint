import {seq, opts, Expression} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class Redefinition extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(opts("FINAL"), "REDEFINITION");
  }
}