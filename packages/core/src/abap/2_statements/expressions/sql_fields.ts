import {seq, Expression, opt} from "../combi";
import {SQLFieldList} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SQLFields extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq("FIELDS", opt("DISTINCT"), SQLFieldList);
  }
}