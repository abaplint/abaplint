import {alt, seq, Expression, ver, optPrio, per} from "../combi";
import {Release} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {SQLSourceSimple} from "./sql_source_simple";
import {DatabaseConnection, SQLPrivilegedAccess} from ".";

export class SQLDmlOptions extends Expression {
  public getRunnable(): IStatementRunnable {
    const usingClient = seq("USING CLIENT", SQLSourceSimple);
    const general = per(SQLPrivilegedAccess, DatabaseConnection);
    const body = alt(seq(usingClient, optPrio(general)), general);
    return ver(Release.v914, seq("OPTIONS", body));
  }
}
