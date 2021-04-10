import {seq, per, opt, alt, str, Expression, altPrio, optPrio, ver} from "../combi";
import {SQLFieldList, SQLFrom, SQLCond, SQLSource, DatabaseConnection, SQLIntoTable, SQLOrderBy, SQLHaving, SQLForAllEntries} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {SQLGroupBy} from "./sql_group_by";
import {SQLIntoStructure} from "./sql_into_structure";

export class Select extends Expression {
  public getRunnable(): IStatementRunnable {
    const into = alt(SQLIntoStructure, SQLIntoTable);

    const where = seq("WHERE", SQLCond);

    const up = seq("UP TO", SQLSource, "ROWS");
    const offset = ver(Version.v751, seq("OFFSET", SQLSource));

    const client = str("CLIENT SPECIFIED");
    const bypass = str("BYPASSING BUFFER");

    const fields = seq("FIELDS", SQLFieldList);

    const perm = per(SQLFrom, into, SQLForAllEntries, where,
                     SQLOrderBy, up, offset, client, SQLHaving, bypass, SQLGroupBy, fields, DatabaseConnection);

    const ret = seq("SELECT",
                    altPrio("DISTINCT", optPrio(seq("SINGLE", optPrio("FOR UPDATE")))),
                    opt(SQLFieldList),
                    perm);

    return ret;
  }
}