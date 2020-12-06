import {Expression, seqs, plus, alts, opts} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Dynamic} from "./dynamic";
import {SQLFieldName} from "./sql_field_name";

export class SQLGroupBy extends Expression {
  public getRunnable(): IStatementRunnable {
    const group = seqs("GROUP BY", plus(seqs(alts(SQLFieldName, Dynamic), opts(","))));
    return group;
  }
}