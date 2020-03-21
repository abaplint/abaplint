import {str, Expression} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class Abstract extends Expression {
  public getRunnable(): IStatementRunnable {
    return str("ABSTRACT");
  }
}