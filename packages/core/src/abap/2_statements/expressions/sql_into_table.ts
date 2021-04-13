import {altPrio, seq, Expression, optPrio} from "../combi";
import {SQLTarget} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SQLIntoTable extends Expression {
  public getRunnable(): IStatementRunnable {
    const into = seq(altPrio("INTO", "APPENDING"),
                     optPrio("CORRESPONDING FIELDS OF"),
                     "TABLE",
                     SQLTarget);
    return into;
  }
}