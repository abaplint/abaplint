import {seq, Expression} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {SQLSource} from "./sql_source";

export class SQLOffset extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq("OFFSET", SQLSource);
  }
}
