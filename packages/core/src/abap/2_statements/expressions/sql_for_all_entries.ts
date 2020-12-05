import {Expression, seqs} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {SQLSource} from "./sql_source";

export class SQLForAllEntries extends Expression {
  public getRunnable(): IStatementRunnable {
    const forAll = seqs("FOR ALL ENTRIES IN", SQLSource);
    return forAll;
  }
}