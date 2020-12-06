import {seq, opt, alt, pluss, Expression} from "../combi";
import {SQLFromSource, SQLCond} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SQLJoin extends Expression {
  public getRunnable(): IStatementRunnable {
    const joinType = seq(opt(alt("INNER", "LEFT OUTER", "LEFT")), "JOIN");

    const join = seq(joinType, SQLFromSource, "ON", pluss(SQLCond));

    return join;
  }
}