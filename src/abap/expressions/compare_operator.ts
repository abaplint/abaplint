import {seq, opt, alt, str, Expression, IStatementRunnable} from "../combi";

export class CompareOperator extends Expression {
  public getRunnable(): IStatementRunnable {

    const operator = seq(opt(str("NOT")),
                         alt(str("="),
                             str("<>"),
                             str("><"),
                             str("<"),
                             str(">"),
                             str("<="),
                             str(">="),
                             str("=>"),
                             str("=<"),
                             str("CA"),
                             str("CO"),
                             str("CP"),
                             str("EQ"),
                             str("NE"),
                             str("CN"),
                             str("GE"),
                             str("GT"),
                             str("LT"),
                             str("LE"),
                             str("CS"),
                             str("NS"),
                             str("NA"),
                             str("NP"),
                             str("BYTE-CO"),
                             str("BYTE-CA"),
                             str("BYTE-CS"),
                             str("BYTE-CN"),
                             str("BYTE-NA"),
                             str("BYTE-NS"),
                             str("O"), // hex comparison operator
                             str("Z"), // hex comparison operator
                             str("M")));

    return operator;
  }
}