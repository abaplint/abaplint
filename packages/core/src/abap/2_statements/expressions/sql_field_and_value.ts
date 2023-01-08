import {seq, Expression} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {SQLFieldName} from "./sql_field_name";
import {SQLSource} from "./sql_source";

export class SQLFieldAndValue extends Expression {
  public getRunnable(): IStatementRunnable {
    const param = seq(SQLFieldName, "=", SQLSource);
    return param;
  }
}