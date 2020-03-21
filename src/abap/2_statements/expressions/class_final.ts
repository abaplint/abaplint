import {str, Expression} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class ClassFinal extends Expression {
  public getRunnable(): IStatementRunnable {
    return str("FINAL");
  }
}