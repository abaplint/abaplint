import {alt, seq, Expression, str, opt} from "../combi";
import {SQLTarget} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SQLTargetTable extends Expression {
  public getRunnable(): IStatementRunnable {
    const intoTable = seq(alt(str("INTO"), str("APPENDING")),
                          opt(str("CORRESPONDING FIELDS OF")),
                          str("TABLE"),
                          new SQLTarget());

    return intoTable;
  }
}