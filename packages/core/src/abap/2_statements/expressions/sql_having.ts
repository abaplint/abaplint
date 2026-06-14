import {Expression, seq} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {SQLCond} from "./sql_cond";

export class SQLHaving extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq("HAVING", SQLCond);
  }
}
