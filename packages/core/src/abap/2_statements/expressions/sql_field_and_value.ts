import {seq, Expression, altPrio} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Integer} from "./integer";
import {SQLArithmeticOperator} from "./sql_arithmetic_operator";
import {SQLFieldName} from "./sql_field_name";
import {SQLSource} from "./sql_source";

export class SQLFieldAndValue extends Expression {
  public getRunnable(): IStatementRunnable {
    const opt1 = seq(altPrio(Integer, SQLFieldName), SQLArithmeticOperator, SQLSource);
    const param = seq(SQLFieldName, "=", altPrio(opt1, SQLSource));
    return param;
  }
}