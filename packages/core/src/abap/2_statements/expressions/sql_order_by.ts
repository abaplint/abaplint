import {Expression, plus, opts, alts, seqs, altPrios} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Dynamic} from "./dynamic";
import {SQLFieldName} from "./sql_field_name";

export class SQLOrderBy extends Expression {
  public getRunnable(): IStatementRunnable {
    const ding = alts("ASCENDING", "DESCENDING");
    const ofields = plus(seqs(SQLFieldName, opts(ding), opts(",")));
    const order = seqs("ORDER BY", altPrios("PRIMARY KEY", Dynamic, ofields));
    return order;
  }
}