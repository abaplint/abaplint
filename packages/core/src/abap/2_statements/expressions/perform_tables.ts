import {seq, str, Expression, plus} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Source} from "./source";

export class PerformTables extends Expression {
  public getRunnable(): IStatementRunnable {
    const tables = seq(str("TABLES"), plus(new Source()));
    return tables;
  }
}