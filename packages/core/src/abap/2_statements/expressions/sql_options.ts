import {alt, seq, Expression, ver, optPrio, per} from "../combi";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {SQLSourceSimple} from "./sql_source_simple";
import {DatabaseConnection, SQLBypassingBuffer, SQLPrivilegedAccess} from ".";

export class SQLOptions extends Expression {
  public getRunnable(): IStatementRunnable {
    const usingClients = alt(seq("CLIENTS IN", alt(SQLSourceSimple, "T000")),
                             "ALL CLIENTS",
                             seq("CLIENT", SQLSourceSimple));

    const privilegedAccess = ver(Version.v758, SQLPrivilegedAccess);

    const general = per(privilegedAccess, SQLBypassingBuffer, DatabaseConnection);

    const usingClause = seq("USING", usingClients, optPrio(general));

    return ver(Version.v758, seq("OPTIONS", alt(usingClause, general)));
  }
}
