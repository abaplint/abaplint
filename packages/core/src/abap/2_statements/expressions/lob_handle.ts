import {seq, Expression} from "../combi";
import * as Expressions from ".";
import {IStatementRunnable} from "../statement_runnable";

export class LOBHandle extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq("WRITER FOR COLUMNS", Expressions.Field);
  }
}