import {seq, opt, tok, regex as reg, Expression, IRunnable} from "../combi";
import {WDash} from "../tokens/";

export class Integer extends Expression {
  public get_runnable(): IRunnable {
    return seq(opt(tok(WDash)), reg(/^\d+$/));
  }
}