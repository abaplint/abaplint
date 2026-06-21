import {seq, optPrio, Expression, ver} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {SQLAsName} from "./sql_as_name";
import {SQLPathForEntity} from "./sql_path_for_entity";
import {WithName} from "./with_name";
import {DatabaseTable} from "./database_table";
import {Version} from "../../../version";

export class SQLAssociationEntry extends Expression {
  public getRunnable(): IStatementRunnable {
    const alias = seq("AS", SQLAsName);
    const redirected = seq("REDIRECTED TO", WithName, "VIA", DatabaseTable);
    return ver(Version.v751, seq(new SQLPathForEntity(), optPrio(alias), optPrio(redirected)));
  }
}
