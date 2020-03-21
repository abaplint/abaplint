import {seq, opt, alt, plus, str, Expression} from "../combi";
import {SQLFromSource, SQLCond} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SQLJoin extends Expression {
  public getRunnable(): IStatementRunnable {
    const joinType = seq(opt(alt(str("INNER"), str("LEFT OUTER"), str("LEFT"))), str("JOIN"));

    const join = seq(joinType,
                     new SQLFromSource(),
                     str("ON"),
                     plus(new SQLCond()));

    return join;
  }
}