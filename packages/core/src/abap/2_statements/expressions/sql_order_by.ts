import {Expression, pluss, opts, alt, seq, altPrio} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Dynamic} from "./dynamic";
import {SQLFieldName} from "./sql_field_name";

export class SQLOrderBy extends Expression {
  public getRunnable(): IStatementRunnable {
    const ding = alt("ASCENDING", "DESCENDING");
    const ofields = pluss(seq(SQLFieldName, opts(ding), opts(",")));
    const order = seq("ORDER BY", altPrio("PRIMARY KEY", Dynamic, ofields));
    return order;
  }
}