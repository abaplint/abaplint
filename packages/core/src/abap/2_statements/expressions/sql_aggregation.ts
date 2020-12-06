import {alts, seq, tok, Expression, optPrios} from "../combi";
import {ParenLeft, ParenLeftW} from "../../1_lexer/tokens";
import {Field} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SQLAggregation extends Expression {
  public getRunnable(): IStatementRunnable {

    const count = seq("COUNT", alts(tok(ParenLeft), tok(ParenLeftW)), optPrios("DISTINCT"), alts("*", Field), ")");
    const max = seq("MAX", alts(tok(ParenLeft), tok(ParenLeftW)), Field, ")");
    const min = seq("MIN", alts(tok(ParenLeft), tok(ParenLeftW)), Field, ")");
    const sum = seq("SUM", alts(tok(ParenLeft), tok(ParenLeftW)), Field, ")");
    const avg = seq("AVG", alts(tok(ParenLeft), tok(ParenLeftW)), Field, ")");

    return alts(count, max, min, sum, avg);

  }
}