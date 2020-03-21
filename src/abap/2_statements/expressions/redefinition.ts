import {seq, opt, str, Expression, IStatementRunnable} from "../combi";

export class Redefinition extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(opt(str("FINAL")), str("REDEFINITION"));
  }
}