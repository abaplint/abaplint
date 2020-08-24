import {str, Expression} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class ClassGlobal extends Expression {
  public getRunnable(): IStatementRunnable {
    return str("PUBLIC");
  }
}