import {seq, per, opt, alt, ver, star, Expression, optPrio, altPrio} from "../combi";
import {SQLSource, SQLFrom, DatabaseTable, Dynamic, SQLCond, SQLFieldName, SQLAggregation, SQLIntoTable, SQLGroupBy, SQLForAllEntries} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {SQLOrderBy} from "./sql_order_by";
import {SQLHaving} from "./sql_having";
import {SQLPath} from "./sql_path";
import {SQLAsName} from "./sql_as_name";
import {SQLCase} from "./sql_case";
import {SQLIntoStructure} from "./sql_into_structure";
import {SQLFieldList} from "./sql_field_list";
import {SQLHints} from "./sql_hints";

export class SelectLoop extends Expression {
  public getRunnable(): IStatementRunnable {
    const where = seq("WHERE", SQLCond);

    const comma = opt(ver(Version.v740sp05, ","));
    const as = seq("AS", SQLAsName);
    const someField = seq(alt(SQLFieldName, SQLPath, SQLAggregation, SQLCase), optPrio(as), comma);
    const fieldList = seq(star(someField), alt(SQLFieldName, SQLPath), optPrio(as), comma, star(someField));

// todo, use SQLFieldList instead?
    const fields = alt("*", Dynamic, fieldList);

    const client = "CLIENT SPECIFIED";
    const bypass = "BYPASSING BUFFER";

    const up = seq("UP TO", SQLSource, "ROWS");

    const pack = seq("PACKAGE SIZE", SQLSource);

    const from2 = seq("FROM", DatabaseTable);

    const tab = seq(SQLIntoTable, alt(pack, seq(from2, pack), seq(pack, from2)));

    const perm = per(SQLFrom,
                     where,
                     up,
                     SQLOrderBy,
                     SQLHaving,
                     client,
                     bypass,
                     SQLGroupBy,
                     SQLForAllEntries,
                     alt(tab, SQLIntoStructure));

    const strict = seq(SQLFrom, "FIELDS", SQLFieldList, where, SQLIntoStructure, up);

    const ret = seq("SELECT",
                    altPrio(seq(optPrio("DISTINCT"), fields, perm), strict),
                    optPrio(SQLHints));

    return ret;
  }
}