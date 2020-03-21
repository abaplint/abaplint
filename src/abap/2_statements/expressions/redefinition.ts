import {seq, opt, str, Expression} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class Redefinition extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(opt(str("FINAL")), str("REDEFINITION"));
  }
}