import {seq, Expression} from "../combi";
import {SQLFieldList} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SQLFields extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq("FIELDS", SQLFieldList);
  }
}