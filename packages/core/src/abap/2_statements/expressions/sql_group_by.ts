import {Expression, seq, plus, alt, opt} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Dynamic} from "./dynamic";
import {SQLFieldName} from "./sql_field_name";

export class SQLGroupBy extends Expression {
  public getRunnable(): IStatementRunnable {
    const group = seq("GROUP BY", plus(seq(alt(SQLFieldName, Dynamic), opt(","))));
    return group;
  }
}