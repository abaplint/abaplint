import {seqs, opt, alt, plus, str, Expression} from "../combi";
import {SQLFromSource, SQLCond} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SQLJoin extends Expression {
  public getRunnable(): IStatementRunnable {
    const joinType = seqs(opt(alt(str("INNER"), str("LEFT OUTER"), str("LEFT"))), "JOIN");

    const join = seqs(joinType,
                      SQLFromSource,
                      "ON",
                      plus(new SQLCond()));

    return join;
  }
}