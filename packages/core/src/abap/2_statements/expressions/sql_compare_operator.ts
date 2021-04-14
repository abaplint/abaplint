import {altPrio, Expression} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class SQLCompareOperator extends Expression {
  public getRunnable(): IStatementRunnable {

    const operator = altPrio("=", "<>", "<", ">", "<=", ">=", "EQ", "NE", "GE", "GT", "LT", "LE", "><", "=>");

    return operator;
  }
}