import {seqs, opts, Expression} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class Redefinition extends Expression {
  public getRunnable(): IStatementRunnable {
    return seqs(opts("FINAL"), "REDEFINITION");
  }
}