import {seqs, opt, alts, plus, Expression} from "../combi";
import {SQLFromSource, SQLCond} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SQLJoin extends Expression {
  public getRunnable(): IStatementRunnable {
    const joinType = seqs(opt(alts("INNER", "LEFT OUTER", "LEFT")), "JOIN");

    const join = seqs(joinType,
                      SQLFromSource,
                      "ON",
                      plus(new SQLCond()));

    return join;
  }
}