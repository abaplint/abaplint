import {alt, str, Expression, IStatementRunnable} from "../combi";

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