import {seq, per, alt, Expression, optPrio, altPrio, ver, plusPrio} from "../combi";
import {SQLSource, SQLFrom, SQLCond, SQLIntoTable, SQLGroupBy, SQLClient, SQLForAllEntries, SQLIntoList, SQLAggregation} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {SQLOrderBy} from "./sql_order_by";
import {SQLHaving} from "./sql_having";
import {SQLIntoStructure} from "./sql_into_structure";
import {SQLHints} from "./sql_hints";
import {SQLFieldListLoop} from "./sql_field_list_loop";
import {SQLUpTo} from "./sql_up_to";
import {Version} from "../../../version";
import {SQLFieldsLoop} from "./sql_fields_loop";

// note: SELECT loops are matched before single statement SELECTs
export class SelectLoop extends Expression {
  public getRunnable(): IStatementRunnable {
    const where = seq("WHERE", SQLCond);

    const bypass = "BYPASSING BUFFER";

    const pack = seq("PACKAGE SIZE", SQLSource);

    const tab = seq(SQLIntoTable, alt(pack, seq(SQLFrom, pack), seq(pack, SQLFrom)));

    const packTab = seq(pack, SQLIntoTable);

    const into = altPrio(SQLIntoStructure, SQLIntoList);

    const perm = per(SQLFrom,
                     where,
                     SQLUpTo,
                     SQLOrderBy,
                     SQLHaving,
                     SQLClient,
                     bypass,
                     SQLGroupBy,
                     SQLForAllEntries,
                     alt(tab, SQLIntoStructure, SQLIntoList, packTab));

    const strict = seq(SQLFrom,
                       ver(Version.v750, SQLFieldsLoop),
                       optPrio(SQLForAllEntries),
                       optPrio(seq(where, optPrio(SQLOrderBy), into, optPrio(SQLUpTo))));

    const aggr = seq(plusPrio(SQLAggregation), into, optPrio(SQLUpTo), SQLFrom, optPrio(where), SQLGroupBy);

    const ret = seq("SELECT",
                    altPrio(seq(optPrio("DISTINCT"), SQLFieldListLoop, perm), strict, aggr),
                    optPrio(SQLHints));

    return ret;
  }
}