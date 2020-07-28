import {Expression, str, seq, plus, alt, opt} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Dynamic} from "./dynamic";
import {SQLFieldName} from "./sql_field_name";

export class SQLGroupBy extends Expression {
  public getRunnable(): IStatementRunnable {
    const group = seq(str("GROUP BY"), plus(seq(alt(new SQLFieldName(), new Dynamic()), opt(str(",")))));
    return group;
  }
}