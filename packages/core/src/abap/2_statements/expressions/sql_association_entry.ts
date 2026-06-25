import {seq, optPrio, altPrio, Expression, ver} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {SQLAsName} from "./sql_as_name";
import {SQLPathForEntity} from "./sql_path_for_entity";
import {SQLDefiningNewAssociation} from "./sql_defining_new_association";
import {WithName} from "./with_name";
import {DatabaseTable} from "./database_table";
import {Release} from "../../../version";

export class SQLAssociationEntry extends Expression {
  public getRunnable(): IStatementRunnable {
    const alias = seq("AS", SQLAsName);
    const redirected = seq("REDIRECTED TO", WithName, "VIA", DatabaseTable);
    const existing = seq(new SQLPathForEntity(), optPrio(alias), optPrio(redirected));

    return ver(Release.v751, altPrio(new SQLDefiningNewAssociation(), existing));
  }
}
