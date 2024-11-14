import {seq, per, str, Expression, altPrio, optPrio, ver} from "../combi";
import {SQLFieldList, SQLFrom, SQLCond, SQLSource, SQLClient, DatabaseConnection, SQLIntoTable, SQLOrderBy, SQLHaving, SQLForAllEntries, SQLHints, SQLFields, SQLIntoList} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {SQLGroupBy} from "./sql_group_by";
import {SQLIntoStructure} from "./sql_into_structure";
import {SQLUpTo} from "./sql_up_to";

export class Select extends Expression {
  public getRunnable(): IStatementRunnable {
    const into = altPrio(SQLIntoTable, SQLIntoStructure, SQLIntoList);

    const where = seq("WHERE", SQLCond);

    const offset = ver(Version.v751, seq("OFFSET", SQLSource));

    const bypass = str("BYPASSING BUFFER");

    const fields = ver(Version.v750, SQLFields);

    // todo, HINTS cannot be anywhere, need an expression dedicated for strict sql
    const perm = per(SQLFrom, into, SQLForAllEntries, where,
                     SQLOrderBy, SQLUpTo, offset, SQLClient, SQLHaving,
                     bypass, SQLGroupBy, fields, DatabaseConnection, SQLHints);

    const permSingle = per(SQLFrom, altPrio(SQLIntoStructure, SQLIntoList), where, SQLClient,
                           bypass, SQLGroupBy, fields, DatabaseConnection, SQLHints);

    const fieldList = optPrio(SQLFieldList);

    const single = seq("SINGLE", optPrio("FOR UPDATE"), fieldList, permSingle);

    const other = seq(optPrio("DISTINCT"), fieldList, perm);

    const ret = seq("SELECT", altPrio(single, other));

    return ret;
  }
}