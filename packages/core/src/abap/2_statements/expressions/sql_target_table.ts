import {alts, seqs, Expression, str, opt} from "../combi";
import {SQLTarget} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SQLTargetTable extends Expression {
  public getRunnable(): IStatementRunnable {
    const intoTable = seqs(alts("INTO", "APPENDING"),
                           opt(str("CORRESPONDING FIELDS OF")),
                           "TABLE",
                           SQLTarget);

    return intoTable;
  }
}