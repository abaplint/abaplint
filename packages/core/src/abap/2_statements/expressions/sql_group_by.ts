import {Expression, seq, pluss, alts, opts} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Dynamic} from "./dynamic";
import {SQLFieldName} from "./sql_field_name";

export class SQLGroupBy extends Expression {
  public getRunnable(): IStatementRunnable {
    const group = seq("GROUP BY", pluss(seq(alts(SQLFieldName, Dynamic), opts(","))));
    return group;
  }
}