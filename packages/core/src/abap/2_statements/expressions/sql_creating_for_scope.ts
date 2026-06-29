import {altPrio, seq, Expression} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {SQLCreatingColumns} from "./sql_creating_columns";

export class SQLCreatingForScope extends Expression {
  public getRunnable(): IStatementRunnable {
    const forAllOther = seq("FOR ALL OTHER",
                            altPrio("BLOB COLUMNS", "CLOB COLUMNS", "COLUMNS"));
    const forAll = seq("FOR ALL",
                       altPrio("BLOB COLUMNS", "CLOB COLUMNS", "COLUMNS"));
    const forColumns = seq("FOR", SQLCreatingColumns);

    return altPrio(forAllOther, forAll, forColumns);
  }
}
