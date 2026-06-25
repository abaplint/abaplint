import {altPrio, seq, optPrio, Expression, ver, tok, AlsoIn, verNotLang} from "../combi";
import {SQLAsName, SQLCDSParameters, DatabaseTable, FieldChain, SQLPrivilegedAccess, SQLProvidedBy, SQLExposeClientAs} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {Release, LanguageVersion} from "../../../version";
import {WAt} from "../../1_lexer/tokens";
import {WithName} from "./with_name";
import {SQLPathForEntity} from "./sql_path_for_entity";
import {SQLHierarchySource} from "./sql_hierarchy_source";
import {SQLHierarchyAccessor} from "./sql_hierarchy_accessor";
import {SQLHierarchyAggregate} from "./sql_hierarchy_aggregate";

export class SQLFromSource extends Expression {
  public getRunnable(): IStatementRunnable {
    const tab = ver(Release.v752, seq(tok(WAt), FieldChain), {also: AlsoIn.OpenABAP});
    const aas = seq("AS", SQLAsName);
    const privileged = ver(Release.v752, seq("WITH", SQLPrivilegedAccess));
    const providedBy = optPrio(ver(Release.v796, SQLProvidedBy));
    const exposeClient = optPrio(ver(Release.v913, SQLExposeClientAs));
    const pathForEntity = optPrio(verNotLang(LanguageVersion.KeyUser, new SQLPathForEntity()));

    return seq(altPrio(new SQLHierarchyAggregate(),
                       new SQLHierarchyAccessor(),
                       new SQLHierarchySource(),
                       seq(WithName, pathForEntity),
                       seq(new DatabaseTable(true), optPrio(SQLCDSParameters), pathForEntity),
                       tab),
               providedBy,
               optPrio(privileged),
               optPrio(aas),
               exposeClient);
  }
}
