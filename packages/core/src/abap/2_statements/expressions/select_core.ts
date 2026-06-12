import {seq, per, str, altPrio, optPrio, ver} from "../combi";
import {SQLFieldList, SQLFrom, SQLCond, SQLSource, SQLClient, DatabaseConnection,
        SQLOrderBy, SQLHaving, SQLForAllEntries, SQLHints, SQLFields,
        SQLIntoList, SQLOptions, SQLPrivilegedAccess} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {SQLGroupBy} from "./sql_group_by";
import {SQLIntoStructure} from "./sql_into_structure";
import {SQLUpTo} from "./sql_up_to";

export function buildSelectCore(into?: IStatementRunnable, allowOrderBy = true): IStatementRunnable {
  const where = seq("WHERE", SQLCond);
  const offset = ver(Version.v751, seq("OFFSET", SQLSource));
  const bypass = str("BYPASSING BUFFER");
  const fields = ver(Version.v750, SQLFields, Version.OpenABAP);
  const privileged = ver(Version.v758, SQLPrivilegedAccess);

  const orderByItems = allowOrderBy ? [SQLOrderBy, SQLUpTo, offset] : [];
  const permItems = [SQLFrom, ...(into ? [into] : []), SQLForAllEntries, where,
    ...orderByItems, SQLClient, SQLHaving,
    bypass, SQLGroupBy, fields, DatabaseConnection, SQLHints, privileged, SQLOptions];
  const perm = per(permItems[0], permItems[1], ...permItems.slice(2));

  const intoSingle = altPrio(SQLIntoStructure, SQLIntoList);
  const permSingleItems = [SQLFrom, ...(into ? [intoSingle] : []), where, SQLClient,
    bypass, SQLGroupBy, fields, DatabaseConnection, SQLHints, privileged, SQLOptions];
  const permSingle = per(permSingleItems[0], permSingleItems[1], ...permSingleItems.slice(2));

  const fieldList = optPrio(SQLFieldList);
  const single = seq("SINGLE", optPrio("FOR UPDATE"), fieldList, permSingle);
  const other = seq(optPrio("DISTINCT"), fieldList, perm);

  return seq("SELECT", altPrio(single, other));
}
