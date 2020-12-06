import {alts, Expression} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class SQLCompareOperator extends Expression {
  public getRunnable(): IStatementRunnable {

    const operator = alts("=",
                          "<>",
                          "><",
                          "<",
                          ">",
                          "<=",
                          "=>",
                          ">=",
                          "EQ",
                          "NE",
                          "GE",
                          "GT",
                          "LT",
                          "LE");

    return operator;
  }
}