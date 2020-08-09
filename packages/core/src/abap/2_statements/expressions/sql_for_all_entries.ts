import {Expression, str, seq} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {SQLSource} from "./sql_source";

export class SQLForAllEntries extends Expression {
  public getRunnable(): IStatementRunnable {
    const forAll = seq(str("FOR ALL ENTRIES IN"), new SQLSource());
    return forAll;
  }
}