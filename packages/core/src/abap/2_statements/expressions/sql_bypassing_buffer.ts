import {str, Expression} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class SQLBypassingBuffer extends Expression {
  public getRunnable(): IStatementRunnable {
    return str("BYPASSING BUFFER");
  }
}
