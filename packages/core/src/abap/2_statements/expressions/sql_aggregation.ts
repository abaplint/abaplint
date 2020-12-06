import {alts, seqs, tok, str, Expression, optPrio} from "../combi";
import {ParenLeft, ParenLeftW} from "../../1_lexer/tokens";
import {Field} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SQLAggregation extends Expression {
  public getRunnable(): IStatementRunnable {

    const count = seqs("COUNT", alts(tok(ParenLeft), tok(ParenLeftW)), optPrio(str("DISTINCT")), alts("*", Field), ")");
    const max = seqs("MAX", alts(tok(ParenLeft), tok(ParenLeftW)), Field, ")");
    const min = seqs("MIN", alts(tok(ParenLeft), tok(ParenLeftW)), Field, ")");
    const sum = seqs("SUM", alts(tok(ParenLeft), tok(ParenLeftW)), Field, ")");
    const avg = seqs("AVG", alts(tok(ParenLeft), tok(ParenLeftW)), Field, ")");

    return alts(count, max, min, sum, avg);

  }
}