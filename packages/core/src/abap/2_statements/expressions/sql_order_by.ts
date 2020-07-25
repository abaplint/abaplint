import {Expression, plus, opt, alt, str, seq, altPrio} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Dynamic} from "./dynamic";
import {SQLFieldName} from "./sql_field_name";

export class SQLOrderBy extends Expression {
  public getRunnable(): IStatementRunnable {
    const ding = alt(str("ASCENDING"), str("DESCENDING"));
    const ofields = plus(seq(new SQLFieldName(), opt(ding), opt(str(","))));
    const order = seq(str("ORDER BY"), altPrio(str("PRIMARY KEY"), new Dynamic(), ofields));
    return order;
  }
}