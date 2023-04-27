import {seq, per, str, Expression, altPrio, optPrio, ver, tok} from "../combi";
import {SQLFieldList, SQLFrom, SQLCond, SQLSource, SQLClient, DatabaseConnection, SQLIntoTable, SQLOrderBy, SQLHaving, SQLForAllEntries, SQLHints} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {SQLGroupBy} from "./sql_group_by";
import {SQLIntoStructure} from "./sql_into_structure";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {SQLFieldName} from "./sql_field_name";
import {SQLUpTo} from "./sql_up_to";

export class Select extends Expression {
  public getRunnable(): IStatementRunnable {
    const into = altPrio(SQLIntoTable, SQLIntoStructure);

    const where = seq("WHERE", SQLCond);

    const offset = ver(Version.v751, seq("OFFSET", SQLSource));

    const bypass = str("BYPASSING BUFFER");

    const fields = ver(Version.v750, seq("FIELDS", SQLFieldList));

    const perm = per(SQLFrom, into, SQLForAllEntries, where,
                     SQLOrderBy, SQLUpTo, offset, SQLClient, SQLHaving,
                     bypass, SQLGroupBy, fields, DatabaseConnection);

    const permSingle = per(SQLFrom, SQLIntoStructure, where, SQLClient, bypass, fields, DatabaseConnection);

    const paren = seq(tok(WParenLeftW), SQLFieldName, tok(WParenRightW));

    const fieldList = optPrio(altPrio(SQLFieldList, paren));

    const single = seq("SINGLE", optPrio("FOR UPDATE"), fieldList, permSingle);

    const other = seq(optPrio("DISTINCT"), fieldList, perm);

    const ret = seq("SELECT", altPrio(single, other), optPrio(SQLHints));

    return ret;
  }
}