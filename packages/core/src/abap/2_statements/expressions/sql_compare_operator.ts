import {alt, str, Expression} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class SQLCompareOperator extends Expression {
  public getRunnable(): IStatementRunnable {

    const operator = alt(str("="),
                         str("<>"),
                         str("><"),
                         str("<"),
                         str(">"),
                         str("<="),
                         str("=>"),
                         str(">="),
                         str("EQ"),
                         str("NE"),
                         str("GE"),
                         str("GT"),
                         str("LT"),
                         str("LE"));

    return operator;
  }
}