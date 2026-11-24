import {Expression, plus, star, opt, alt, seq, altPrio, ver, stopBefore, stopBefore1} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Dynamic} from "./dynamic";
import {Release} from "../../../version";
import {SQLField} from "./sql_field";
import {SQLFieldName} from "./sql_field_name";

export class SQLOrderBy extends Expression {
  public getRunnable(): IStatementRunnable {
    const ding = alt("ASCENDING", "DESCENDING");
    const nulls = ver(Release.v778, seq("NULLS", alt("FIRST", "LAST")));
    const item = altPrio(ver(Release.v789, SQLField), SQLFieldName);
    const entry = seq(item, opt(ding), opt(nulls));
    // without commas only column names, SQL expressions need the comma separated list.
    // UP TO and OFFSET are not taken as column names, they are not allowed after ORDER BY, #2555
    const commaList = seq(entry, star(seq(",", entry)));
    const blankList = plus(seq(stopBefore("UP", "TO"), stopBefore1("OFFSET"), SQLFieldName, opt(ding), opt(nulls)));
    const ofields = alt(commaList, blankList);
    const order = seq("ORDER BY", altPrio("PRIMARY KEY", Dynamic, ofields));
    return order;
  }
}