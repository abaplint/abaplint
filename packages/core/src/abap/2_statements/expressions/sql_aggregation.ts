import {alt, seq, tok, str, Expression, opt} from "../combi";
import {ParenLeft, ParenLeftW} from "../../1_lexer/tokens";
import {Field} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SQLAggregation extends Expression {
  public getRunnable(): IStatementRunnable {

    const count = seq(str("COUNT"), alt(tok(ParenLeft), tok(ParenLeftW)), opt(str("DISTINCT")), alt(str("*"), new Field()), str(")"));
    const max = seq(opt(str("DISTINCT")), str("MAX"), alt(tok(ParenLeft), tok(ParenLeftW)), new Field(), str(")"));
    const min = seq(str("MIN"), alt(tok(ParenLeft), tok(ParenLeftW)), new Field(), str(")"));
    const sum = seq(str("SUM"), alt(tok(ParenLeft), tok(ParenLeftW)), new Field(), str(")"));
    const avg = seq(str("AVG"), alt(tok(ParenLeft), tok(ParenLeftW)), new Field(), str(")"));

    return alt(count, max, min, sum, avg);

  }
}