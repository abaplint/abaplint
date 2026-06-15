import {seq, optPrio, altPrio, Expression, ver} from "../combi";
import {SQLFromSource, SQLCond} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";

export class SQLJoin extends Expression {
  public getRunnable(): IStatementRunnable {
    const joinType = seq(optPrio(altPrio("INNER", "LEFT OUTER", "LEFT", "RIGHT OUTER", "RIGHT")), "JOIN");

    const join = seq(joinType, SQLFromSource, "ON", SQLCond);

    const crossJoin = ver(Version.v750, seq("CROSS JOIN", SQLFromSource), Version.OpenABAP);

    return altPrio(crossJoin, join);
  }
}