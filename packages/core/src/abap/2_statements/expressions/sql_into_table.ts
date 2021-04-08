import {alt, seq, Expression, opt} from "../combi";
import {SQLTarget} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SQLIntoTable extends Expression {
  public getRunnable(): IStatementRunnable {
    const into = seq(alt("INTO", "APPENDING"),
                     opt("CORRESPONDING FIELDS OF"),
                     "TABLE",
                     SQLTarget);
    return into;
  }
}