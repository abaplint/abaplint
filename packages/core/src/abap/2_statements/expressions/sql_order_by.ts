import {Expression, plus, opt, alts, str, seqs, altPrio} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Dynamic} from "./dynamic";
import {SQLFieldName} from "./sql_field_name";

export class SQLOrderBy extends Expression {
  public getRunnable(): IStatementRunnable {
    const ding = alts("ASCENDING", "DESCENDING");
    const ofields = plus(seqs(SQLFieldName, opt(ding), opt(str(","))));
    const order = seqs("ORDER BY", altPrio(str("PRIMARY KEY"), new Dynamic(), ofields));
    return order;
  }
}