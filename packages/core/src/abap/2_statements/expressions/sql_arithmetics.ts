import {seq, alt, Expression, starPrio} from "../combi";
import {SQLFieldName, SQLFunction} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {SQLArithmeticOperator} from "./sql_arithmetic_operator";

export class SQLArithmetics extends Expression {
  public getRunnable(): IStatementRunnable {
    const field = alt(SQLFieldName, SQLFunction);
    return seq(field, starPrio(seq(SQLArithmeticOperator, field)));
  }
}