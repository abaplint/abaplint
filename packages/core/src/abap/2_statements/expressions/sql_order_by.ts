import {Expression, plus, opt, alt, str, seqs, altPrio} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Dynamic} from "./dynamic";
import {SQLFieldName} from "./sql_field_name";

export class SQLOrderBy extends Expression {
  public getRunnable(): IStatementRunnable {
    const ding = alt(str("ASCENDING"), str("DESCENDING"));
    const ofields = plus(seqs(SQLFieldName, opt(ding), opt(str(","))));
    const order = seqs("ORDER BY", altPrio(str("PRIMARY KEY"), new Dynamic(), ofields));
    return order;
  }
}