import {alt, seqs, Expression, str, opt} from "../combi";
import {SQLTarget} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SQLTargetTable extends Expression {
  public getRunnable(): IStatementRunnable {
    const intoTable = seqs(alt(str("INTO"), str("APPENDING")),
                           opt(str("CORRESPONDING FIELDS OF")),
                           "TABLE",
                           SQLTarget);

    return intoTable;
  }
}