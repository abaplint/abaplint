import {seq, tok, alt, Expression, IRunnable} from "../combi";
import {BracketLeft, BracketRight, BracketRightW} from "../tokens/";

export class TableBody extends Expression {
  public getRunnable(): IRunnable {
    const ret = seq(tok(BracketLeft), alt(tok(BracketRight), tok(BracketRightW)));
    return ret;
  }
}