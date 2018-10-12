import {alt, tok, Expression, IRunnable} from "../combi";
import {Arrow, Dash} from "../tokens/";

export class ArrowOrDash extends Expression {
  public getRunnable(): IRunnable {
    return alt(tok(Arrow), tok(Dash));
  }
}