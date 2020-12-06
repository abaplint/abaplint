import {altPrio, Expression} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class CompareOperator extends Expression {
  public getRunnable(): IStatementRunnable {

    const operator = altPrio("=",
                             "<>",
                             "><",
                             "<",
                             ">",
                             "<=",
                             ">=",
                             "=>",
                             "=<",
                             "CA",
                             "CO",
                             "CP",
                             "EQ",
                             "NE",
                             "CN",
                             "GE",
                             "GT",
                             "LT",
                             "LE",
                             "CS",
                             "NS",
                             "NA",
                             "NP",
                             "BYTE-CO",
                             "BYTE-CA",
                             "BYTE-CS",
                             "BYTE-CN",
                             "BYTE-NA",
                             "BYTE-NS",
                             "O", // hex comparison operator
                             "Z", // hex comparison operator
                             "M");
    return operator;
  }
}