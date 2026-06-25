import {seq, optPrio, altPrio, Expression, ver, AlsoIn} from "../combi";
import {SQLCond} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {Release} from "../../../version";
import {SQLJoinSource} from "./sql_join_source";

export class SQLJoin extends Expression {
  public getRunnable(): IStatementRunnable {
    const joinType = seq(optPrio(altPrio("INNER", "LEFT OUTER", "LEFT", "RIGHT OUTER", "RIGHT")), "JOIN");

    const join = seq(joinType, new SQLJoinSource(), "ON", SQLCond);

    const crossJoin = ver(Release.v750, seq("CROSS JOIN", new SQLJoinSource()), {also: AlsoIn.OpenABAP});

    return altPrio(crossJoin, join);
  }
}