import {alt, seq, tok, str, Expression, IRunnable, opt} from "../combi";
import {ParenLeft, ParenLeftW} from "../tokens/";
import {Field} from "./";

export class SQLAggregation extends Expression {
  public getRunnable(): IRunnable {

    let count = seq(str("COUNT"), alt(tok(ParenLeft), tok(ParenLeftW)), opt(str("DISTINCT")), alt(str("*"), new Field()), str(")"));
    let max = seq(str("MAX"), alt(tok(ParenLeft), tok(ParenLeftW)), new Field(), str(")"));
    let min = seq(str("MIN"), alt(tok(ParenLeft), tok(ParenLeftW)), new Field(), str(")"));
    let sum = seq(str("SUM"), alt(tok(ParenLeft), tok(ParenLeftW)), new Field(), str(")"));
    let avg = seq(str("AVG"), alt(tok(ParenLeft), tok(ParenLeftW)), new Field(), str(")"));

    return alt(count, max, min, sum, avg);

  }
}