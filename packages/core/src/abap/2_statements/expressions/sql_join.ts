import {seq, optPrio, altPrio, Expression} from "../combi";
import {SQLFromSource, SQLCond} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SQLJoin extends Expression {
  public getRunnable(): IStatementRunnable {
    const joinType = seq(optPrio(altPrio("INNER", "LEFT OUTER", "LEFT", "RIGHT OUTER", "RIGHT")), "JOIN");

    const join = seq(joinType, SQLFromSource, "ON", SQLCond);

    return join;
  }
}