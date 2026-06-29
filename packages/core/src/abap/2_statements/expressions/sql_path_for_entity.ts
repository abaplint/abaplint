import {seq, plus, optPrio, Expression, ver} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {SQLPathSegment} from "./sql_path_segment";
import {DatabaseTable} from "./database_table";
import {Release} from "../../../version";

export class SQLPathForEntity extends Expression {
  public getRunnable(): IStatementRunnable {
    return ver(Release.v740sp05, seq(optPrio(DatabaseTable), plus(new SQLPathSegment())));
  }
}
