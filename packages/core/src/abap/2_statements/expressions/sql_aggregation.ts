import {alt, seq, tok, Expression, optPrio} from "../combi";
import {ParenLeft, ParenLeftW} from "../../1_lexer/tokens";
import {Field} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SQLAggregation extends Expression {
  public getRunnable(): IStatementRunnable {

    const count = seq("COUNT", alt(tok(ParenLeft), tok(ParenLeftW)), optPrio("DISTINCT"), alt("*", Field), ")");
    const max = seq("MAX", alt(tok(ParenLeft), tok(ParenLeftW)), Field, ")");
    const min = seq("MIN", alt(tok(ParenLeft), tok(ParenLeftW)), Field, ")");
    const sum = seq("SUM", alt(tok(ParenLeft), tok(ParenLeftW)), Field, ")");
    const avg = seq("AVG", alt(tok(ParenLeft), tok(ParenLeftW)), Field, ")");

    return alt(count, max, min, sum, avg);

  }
}