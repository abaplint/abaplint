import {Expression, plus, opt, alt, seq, altPrio, ver} from "../combi";
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
    const ofields = plus(seq(item, opt(ding), opt(nulls), opt(",")));
    const order = seq("ORDER BY", altPrio("PRIMARY KEY", Dynamic, ofields));
    return order;
  }
}