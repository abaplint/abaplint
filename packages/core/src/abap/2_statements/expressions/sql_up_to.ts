import {seq, Expression} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {SQLSource} from "./sql_source";

export class SQLUpTo extends Expression {
  public getRunnable(): IStatementRunnable {
    const up = seq("UP TO", SQLSource, "ROWS");
    return up;
  }
}