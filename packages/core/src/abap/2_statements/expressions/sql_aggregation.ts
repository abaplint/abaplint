import {alt, seqs, tok, str, Expression, optPrio} from "../combi";
import {ParenLeft, ParenLeftW} from "../../1_lexer/tokens";
import {Field} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SQLAggregation extends Expression {
  public getRunnable(): IStatementRunnable {

    const count = seqs("COUNT", alt(tok(ParenLeft), tok(ParenLeftW)), optPrio(str("DISTINCT")), alt(str("*"), new Field()), str(")"));
    const max = seqs("MAX", alt(tok(ParenLeft), tok(ParenLeftW)), new Field(), str(")"));
    const min = seqs("MIN", alt(tok(ParenLeft), tok(ParenLeftW)), new Field(), str(")"));
    const sum = seqs("SUM", alt(tok(ParenLeft), tok(ParenLeftW)), new Field(), str(")"));
    const avg = seqs("AVG", alt(tok(ParenLeft), tok(ParenLeftW)), new Field(), str(")"));

    return alt(count, max, min, sum, avg);

  }
}