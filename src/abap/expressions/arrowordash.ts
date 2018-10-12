import {alt, tok, Expression, IRunnable} from "../combi";
import {Arrow, Dash} from "../tokens/";

export class ArrowOrDash extends Expression {
  public get_runnable(): IRunnable {
    return alt(tok(Arrow), tok(Dash));
  }
}