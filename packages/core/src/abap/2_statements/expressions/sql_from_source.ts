import {altPrio, seq, optPrio, Expression, ver, tok, AlsoIn} from "../combi";
import {SQLAsName, SQLCDSParameters, DatabaseTable, FieldChain, SQLPrivilegedAccess} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {Release} from "../../../version";
import {WAt} from "../../1_lexer/tokens";
import {WithName} from "./with_name";
import {SQLPathForEntity} from "./sql_path_for_entity";
import {SQLHierarchySource} from "./sql_hierarchy_source";
import {SQLHierarchyAccessor} from "./sql_hierarchy_accessor";
import {SQLHierarchyAggregate} from "./sql_hierarchy_aggregate";

export class SQLFromSource extends Expression {
  public getRunnable(): IStatementRunnable {
    // https://help.sap.com/doc/abapdocu_752_index_htm/7.52/en-US/abennews-752-open_sql.htm#!ABAP_MODIFICATION_1@1@
    const tab = ver(Release.v752, seq(tok(WAt), FieldChain), {also: AlsoIn.OpenABAP});
    const aas = seq("AS", SQLAsName);
    const privileged = ver(Release.v752, seq("WITH", SQLPrivilegedAccess));

    return seq(altPrio(new SQLHierarchyAggregate(),
                       new SQLHierarchyAccessor(),
                       new SQLHierarchySource(),
                       seq(WithName, optPrio(new SQLPathForEntity())),
                       seq(DatabaseTable, optPrio(SQLCDSParameters), optPrio(new SQLPathForEntity())),
                       tab),
               optPrio(privileged),
               optPrio(aas));
  }
}
