import {seq, plus, optPrio, altPrio, Expression, ver} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {SQLPathSegment} from "./sql_path_segment";
import {DatabaseTable} from "./database_table";
import {SQLCTEPathPrefix} from "./sql_cte_path_prefix";
import {Release} from "../../../version";

export class SQLPathForEntity extends Expression {
  public getRunnable(): IStatementRunnable {
    const prefix = altPrio(new SQLCTEPathPrefix(), new DatabaseTable());
    return ver(Release.v740sp05, seq(optPrio(prefix), plus(new SQLPathSegment())));
  }
}
