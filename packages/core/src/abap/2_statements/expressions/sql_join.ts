import {seq, optPrio, altPrio, plusPrio, Expression} from "../combi";
import {SQLFromSource, SQLCond} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SQLJoin extends Expression {
  public getRunnable(): IStatementRunnable {
    const joinType = seq(optPrio(altPrio("INNER", "LEFT OUTER", "LEFT")), "JOIN");

    const join = seq(joinType, SQLFromSource, "ON", plusPrio(SQLCond));

    return join;
  }
}