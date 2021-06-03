import {seq, per, str, Expression, altPrio, optPrio, ver, tok} from "../combi";
import {SQLFieldList, SQLFrom, SQLCond, SQLSource, DatabaseConnection, SQLIntoTable, SQLOrderBy, SQLHaving, SQLForAllEntries} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {SQLGroupBy} from "./sql_group_by";
import {SQLIntoStructure} from "./sql_into_structure";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {SQLFieldName} from "./sql_field_name";

export class Select extends Expression {
  public getRunnable(): IStatementRunnable {
    const into = altPrio(SQLIntoTable, SQLIntoStructure);

    const where = seq("WHERE", SQLCond);

    const up = seq("UP TO", SQLSource, "ROWS");
    const offset = ver(Version.v751, seq("OFFSET", SQLSource));

    const client = str("CLIENT SPECIFIED");
    const bypass = str("BYPASSING BUFFER");

    const fields = seq("FIELDS", SQLFieldList);

    const perm = per(SQLFrom, into, SQLForAllEntries, where,
                     SQLOrderBy, up, offset, client, SQLHaving,
                     bypass, SQLGroupBy, fields, DatabaseConnection);

    const paren = seq(tok(WParenLeftW), SQLFieldName, tok(WParenRightW));

    const ret = seq("SELECT",
                    altPrio("DISTINCT", optPrio(seq("SINGLE", optPrio("FOR UPDATE")))),
                    optPrio(altPrio(SQLFieldList, paren)),
                    perm);

    return ret;
  }
}