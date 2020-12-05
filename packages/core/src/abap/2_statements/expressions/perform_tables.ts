import {seqs, Expression, plus} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Source} from "./source";

export class PerformTables extends Expression {
  public getRunnable(): IStatementRunnable {
    const tables = seqs("TABLES", plus(new Source()));
    return tables;
  }
}