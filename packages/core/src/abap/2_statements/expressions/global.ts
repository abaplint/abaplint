import {str, Expression} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class Global extends Expression {
  public getRunnable(): IStatementRunnable {
    return str("PUBLIC");
  }
}