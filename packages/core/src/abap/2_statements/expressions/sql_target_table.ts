import {alt, seq, Expression, opt} from "../combi";
import {SQLTarget} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SQLTargetTable extends Expression {
  public getRunnable(): IStatementRunnable {
    const intoTable = seq(alt("INTO", "APPENDING"),
                          opt("CORRESPONDING FIELDS OF"),
                          "TABLE",
                          SQLTarget);

    return intoTable;
  }
}