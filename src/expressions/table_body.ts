import {seq, tok, alt, Reuse, IRunnable} from "../combi";
import {BracketLeft, BracketRight, BracketRightW} from "../tokens/";

export class TableBody extends Reuse {
  public get_runnable(): IRunnable {
    let ret = seq(tok(BracketLeft), alt(tok(BracketRight), tok(BracketRightW)));
    return ret;
  }
}