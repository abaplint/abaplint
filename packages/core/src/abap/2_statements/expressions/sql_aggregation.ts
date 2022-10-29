import {seq, altPrio, tok, Expression, optPrio} from "../combi";
import {ParenLeft, ParenLeftW} from "../../1_lexer/tokens";
import {Field, SQLFunction} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {Dynamic} from "./dynamic";
import {SQLArithmetics} from "./sql_arithmetics";

export class SQLAggregation extends Expression {
  public getRunnable(): IStatementRunnable {
    const f = altPrio(SQLArithmetics, Dynamic, SQLFunction);
    const fparen = seq("(", Field, ")");
    const count = seq("COUNT", altPrio(tok(ParenLeft), tok(ParenLeftW)), optPrio("DISTINCT"), altPrio("*", Field, fparen), ")");
    const max = seq("MAX", altPrio(tok(ParenLeft), tok(ParenLeftW)), f, ")");
    const min = seq("MIN", altPrio(tok(ParenLeft), tok(ParenLeftW)), f, ")");
    const sum = seq("SUM", altPrio(tok(ParenLeft), tok(ParenLeftW)), f, ")");
    const avg = seq("AVG", altPrio(tok(ParenLeft), tok(ParenLeftW)), f, ")");

    return altPrio(count, max, min, sum, avg);
  }
}