import {Expression, seq, plus, alt, altPrio} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Dynamic} from "./dynamic";
import {SQLFieldName} from "./sql_field_name";

export class SQLGroupBy extends Expression {
  public getRunnable(): IStatementRunnable {
    const f = alt(SQLFieldName, Dynamic);
    const strict = seq(plus(seq(f, ",")), f);
    const group = seq("GROUP BY", altPrio(strict, plus(f)));
    return group;
  }
}