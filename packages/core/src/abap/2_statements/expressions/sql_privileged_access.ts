import {seq, Expression, ver, optPrio} from "../combi";
import {Release} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {SQLSourceSimple} from "./sql_source_simple";

export class SQLPrivilegedAccess extends Expression {
  public getRunnable(): IStatementRunnable {
    const accessLevel = ver(Release.v917, seq("LEVEL", SQLSourceSimple));
    return seq("PRIVILEGED ACCESS", optPrio(accessLevel));
  }
}
