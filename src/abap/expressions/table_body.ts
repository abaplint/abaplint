import {seq, tok, alt, Expression, IStatementRunnable} from "../combi";
import {BracketLeft, BracketRight, BracketRightW} from "../tokens/";

export class TableBody extends Expression {
  public getRunnable(): IStatementRunnable {
    const ret = seq(tok(BracketLeft), alt(tok(BracketRight), tok(BracketRightW)));
    return ret;
  }
}