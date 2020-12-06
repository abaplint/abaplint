import {seqs, opts, alts, pluss, Expression} from "../combi";
import {SQLFromSource, SQLCond} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SQLJoin extends Expression {
  public getRunnable(): IStatementRunnable {
    const joinType = seqs(opts(alts("INNER", "LEFT OUTER", "LEFT")), "JOIN");

    const join = seqs(joinType, SQLFromSource, "ON", pluss(SQLCond));

    return join;
  }
}