import {seq, optPrio, altPrio, plus, Expression} from "../combi";
import {SQLFromSource, SQLCond} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SQLJoin extends Expression {
  public getRunnable(): IStatementRunnable {
    const joinType = seq(optPrio(altPrio("INNER", "LEFT OUTER", "LEFT")), "JOIN");

    const join = seq(joinType, SQLFromSource, "ON", plus(SQLCond));

    return join;
  }
}