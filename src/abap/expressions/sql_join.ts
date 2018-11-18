import {seq, opt, alt, plus, str, Expression, IRunnable} from "../combi";
import {DatabaseTable, Field, SQLCond} from "./";

export class SQLJoin extends Expression {
  public getRunnable(): IRunnable {
    const aas = seq(str("AS"), new Field());

    const joinType = seq(opt(alt(str("INNER"), str("LEFT OUTER"), str("LEFT"))), str("JOIN"));

    const join = seq(joinType,
                     new DatabaseTable(),
                     opt(aas),
                     str("ON"),
                     plus(new SQLCond()));

    return join;
  }
}