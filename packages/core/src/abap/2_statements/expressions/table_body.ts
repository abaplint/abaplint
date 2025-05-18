import {seq, tok, Expression, altPrio} from "../combi";
import {BracketLeft, BracketRight, BracketRightW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class TableBody extends Expression {
  public getRunnable(): IStatementRunnable {
    const ret = seq(tok(BracketLeft), altPrio(tok(BracketRightW), tok(BracketRight)));
    return ret;
  }
}