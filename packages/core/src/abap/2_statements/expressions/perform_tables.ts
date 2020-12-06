import {seqs, Expression, pluss} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Source} from "./source";

export class PerformTables extends Expression {
  public getRunnable(): IStatementRunnable {
    const tables = seqs("TABLES", pluss(Source));
    return tables;
  }
}