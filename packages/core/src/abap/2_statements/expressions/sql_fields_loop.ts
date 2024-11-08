import {seq, Expression, opt} from "../combi";
import {SQLFieldListLoop} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SQLFieldsLoop extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq("FIELDS", opt("DISTINCT"), SQLFieldListLoop);
  }
}