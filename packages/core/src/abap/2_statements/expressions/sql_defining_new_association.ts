import {seq, optPrio, altPrio, regex as reg, Expression, ver} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {SQLAsName} from "./sql_as_name";
import {SQLCond} from "./sql_cond";
import {SQLPathJoinType} from "./sql_path_join_type";
import {DatabaseTable} from "./database_table";
import {WithName} from "./with_name";
import {Release} from "../../../version";

export class SQLDefiningNewAssociation extends Expression {
  public getRunnable(): IStatementRunnable {
    const joinTag = optPrio(reg(/^#[A-Z][A-Z0-9_]*$/i));
    const target = altPrio(new DatabaseTable(true), WithName);
    return ver(Release.v751, seq(
      "JOIN",
      joinTag,
      optPrio(SQLPathJoinType),
      target,
      "AS",
      SQLAsName,
      "ON",
      SQLCond,
    ));
  }
}
