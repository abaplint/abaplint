import {seqs, opt, str, Expression} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class Redefinition extends Expression {
  public getRunnable(): IStatementRunnable {
    return seqs(opt(str("FINAL")), "REDEFINITION");
  }
}